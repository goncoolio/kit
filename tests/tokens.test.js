jest.mock('../src/Email/sendEmail', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }));

const jwt = require('jsonwebtoken');
const moment = require('moment');
const {
    AUTH, app, db, request,
    resetDatabase, closeDatabase, createLoggedInUser, authed,
} = require('./helpers');
const { generateToken } = require('../src/services/tokenService');
const { tokenTypes } = require('../src/config/tokens');

beforeEach(resetDatabase);
afterAll(closeDatabase);

const refresh = (refresh_token) => request(app).post(`${AUTH}/refresh-token`).send({ refresh_token });

describe('POST /refresh-token', () => {
    it('délivre une nouvelle paire de tokens', async () => {
        const { refreshToken } = await createLoggedInUser();

        const res = await refresh(refreshToken);

        // Régression : verifyToken lisait payload.user_uuid alors que
        // generateToken signe uuid, l'endpoint échouait systématiquement
        expect(res.status).toBe(201);
        expect(res.body.response.data.access.token).toEqual(expect.any(String));
        expect(res.body.response.data.refresh.token).toEqual(expect.any(String));
    });

    it("émet des tokens portant l'uuid du compte", async () => {
        const { refreshToken, user } = await createLoggedInUser();

        const res = await refresh(refreshToken);
        const payload = jwt.decode(res.body.response.data.access.token);

        // Régression : les tokens étaient émis avec un uuid undefined
        expect(payload.uuid).toBe(user.uuid);
        expect(payload.type).toBe(tokenTypes.ACCESS);
    });

    it('persiste les nouveaux tokens avec user_uuid', async () => {
        const { refreshToken, user } = await createLoggedInUser();

        const res = await refresh(refreshToken);
        const stored = await db.Token.findOne({
            where: { token: res.body.response.data.access.token },
        });

        expect(stored).not.toBeNull();
        expect(stored.user_uuid).toBe(user.uuid);
    });

    it('produit un token réellement utilisable', async () => {
        const { refreshToken } = await createLoggedInUser();

        const refreshed = await refresh(refreshToken);
        const res = await authed('get', '/profile', refreshed.body.response.data.access.token);

        expect(res.status).toBe(200);
    });

    it("invalide l'ancien refresh token après rotation", async () => {
        const { refreshToken } = await createLoggedInUser();
        await refresh(refreshToken);

        const res = await refresh(refreshToken);

        expect(res.status).toBe(401);
    });

    it('rejette un refresh token inconnu', async () => {
        await createLoggedInUser();

        const res = await refresh('token-inconnu');

        expect(res.status).toBe(401);
    });

    it('rejette une requête sans refresh token', async () => {
        const res = await request(app).post(`${AUTH}/refresh-token`).send({});

        expect(res.status).toBe(400);
    });

    it('rejette un refresh token expiré', async () => {
        const { refreshToken } = await createLoggedInUser();
        const stored = await db.Token.findOne({ where: { token: refreshToken } });
        await stored.update({ expires: moment().subtract(1, 'day').toDate() });

        const res = await refresh(refreshToken);

        expect(res.status).toBe(401);
    });

    it("rejette un access token présenté comme refresh token", async () => {
        const { accessToken } = await createLoggedInUser();

        const res = await refresh(accessToken);

        expect(res.status).toBe(401);
    });
});

describe('format des tokens', () => {
    it('émet un token unique à chaque appel', async () => {
        const { user } = await createLoggedInUser();
        const expires = moment().add(30, 'days');

        const a = generateToken(user.uuid, expires, tokenTypes.REFRESH);
        const b = generateToken(user.uuid, expires, tokenTypes.REFRESH);

        // Régression : sans jti, deux tokens émis dans la même seconde pour le
        // même compte étaient identiques et la rotation restait sans effet
        expect(a).not.toBe(b);
    });

    it('émet des tokens qui tiennent dans la colonne token', async () => {
        const { user } = await createLoggedInUser();
        const token = generateToken(user.uuid, moment().add(30, 'days'), tokenTypes.ACCESS);

        // SQLite n'applique pas les longueurs de colonne : l'assertion doit
        // être explicite pour protéger MySQL en mode strict
        const length = db.Token.rawAttributes.token.type.options.length;
        expect(length).toBeGreaterThanOrEqual(token.length);
    });
});

describe('typage des tokens', () => {
    it("refuse un refresh token comme token d'accès", async () => {
        const { refreshToken } = await createLoggedInUser();

        const res = await authed('get', '/profile', refreshToken);

        // Le refresh token est bien en base : seule la vérification du type
        // empêche d'ouvrir une session avec
        expect(res.status).toBe(401);
    });

    it('refuse un token signé avec un autre secret', async () => {
        const { user } = await createLoggedInUser();
        const forged = jwt.sign(
            { uuid: user.uuid, type: tokenTypes.ACCESS, exp: moment().add(1, 'hour').unix() },
            'mauvais-secret',
        );

        const res = await authed('get', '/profile', forged);

        expect(res.status).toBe(401);
    });

    it("refuse un token valide qui n'est pas en base", async () => {
        const { user } = await createLoggedInUser();
        const orphan = generateToken(user.uuid, moment().add(1, 'hour'), tokenTypes.ACCESS);

        const res = await authed('get', '/profile', orphan);

        expect(res.status).toBe(401);
    });

    it('refuse un token blacklisté', async () => {
        const { accessToken } = await createLoggedInUser();
        const stored = await db.Token.findOne({ where: { token: accessToken } });
        await stored.update({ blacklisted: true });

        const res = await authed('get', '/profile', accessToken);

        // Régression : la colonne blacklisted n'était jamais consultée
        expect(res.status).toBe(401);
    });

    it('refuse un token expiré', async () => {
        const { user } = await createLoggedInUser();
        const expired = generateToken(user.uuid, moment().subtract(1, 'minute'), tokenTypes.ACCESS);
        await db.Token.create({
            token: expired,
            user_uuid: user.uuid,
            type: tokenTypes.ACCESS,
            expires: moment().subtract(1, 'minute').toDate(),
            blacklisted: false,
        });

        const res = await authed('get', '/profile', expired);

        expect(res.status).toBe(401);
    });
});

describe('POST /logout', () => {
    const logout = (body, token) => {
        const req = request(app).post(`${AUTH}/logout`);
        if (token) req.set('Authorization', `Bearer ${token}`);
        return req.send(body);
    };

    it('supprime les deux tokens et invalide la session', async () => {
        const { accessToken, refreshToken } = await createLoggedInUser();

        const res = await logout({ refresh_token: refreshToken }, accessToken);

        expect(res.status).toBe(200);
        expect(await db.Token.findOne({ where: { token: accessToken } })).toBeNull();
        expect(await db.Token.findOne({ where: { token: refreshToken } })).toBeNull();
        expect((await authed('get', '/profile', accessToken)).status).toBe(401);
    });

    it("fonctionne sans entête Authorization", async () => {
        const { refreshToken } = await createLoggedInUser();

        const res = await logout({ refresh_token: refreshToken });

        // Régression : req.headers.authorization.split() plantait et la
        // requête restait suspendue faute d'asyncHandler
        expect(res.status).toBe(200);
    });

    it('renvoie 404 sur un refresh token inconnu', async () => {
        await createLoggedInUser();

        const res = await logout({ refresh_token: 'inconnu' });

        expect(res.status).toBe(404);
    });

    it('rejette une requête sans refresh token', async () => {
        const res = await logout({});

        expect(res.status).toBe(400);
    });
});
