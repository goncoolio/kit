jest.mock('../src/Email/sendEmail', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }));

const {
    AUTH, app, db, request, defaultUser,
    resetDatabase, closeDatabase, register, login, createLoggedInUser, authed,
} = require('./helpers');
const { sendEmail } = require('../src/Email/sendEmail');

beforeEach(async () => {
    await resetDatabase();
    sendEmail.mockClear();
});

afterAll(closeDatabase);

describe('POST /register', () => {
    it('crée le compte et renvoie les deux tokens', async () => {
        const res = await register();

        expect(res.status).toBe(201);
        expect(res.body.tokens.access.token).toEqual(expect.any(String));
        expect(res.body.tokens.refresh.token).toEqual(expect.any(String));
    });

    it("enregistre un statut conforme à l'ENUM de la colonne", async () => {
        await register();
        const user = await db.User.findOne({ where: { email: defaultUser.email } });

        // Régression : la constante valait 1, hors ENUM('active','inactive','deleted','blocked')
        expect(user.status).toBe('active');
    });

    it('envoie un email de vérification avec un code à 7 chiffres', async () => {
        await register();

        expect(sendEmail).toHaveBeenCalledTimes(1);
        expect(sendEmail.mock.calls[0][0].email_verification_code).toMatch(/^\d{7}$/);
    });

    it("n'échoue pas quand l'envoi de l'email échoue", async () => {
        sendEmail.mockRejectedValueOnce(new Error('SMTP indisponible'));

        const res = await register();

        // Le compte est bien créé : l'utilisateur ne doit pas se retrouver
        // bloqué avec un email déjà pris et aucun compte utilisable
        expect(res.status).toBe(201);
        expect(await db.User.findOne({ where: { email: defaultUser.email } })).not.toBeNull();
    });

    it('refuse un email déjà utilisé', async () => {
        await register();
        const res = await register({ tel: '+22599999999' });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toMatch(/Email already taken/);
    });

    it('refuse un numéro de téléphone déjà utilisé', async () => {
        await register();
        const res = await register({ email: 'autre@example.com' });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toMatch(/Tel already taken/);
    });

    it('rejette une charge utile invalide', async () => {
        const res = await request(app).post(`${AUTH}/register`).send({ email: 'pas-un-email' });

        expect(res.status).toBe(400);
    });
});

describe('POST /login', () => {
    beforeEach(async () => { await register(); });

    it('renvoie les tokens sur des identifiants valides', async () => {
        const res = await login();

        expect(res.status).toBe(200);
        expect(res.body.tokens.access.token).toEqual(expect.any(String));
    });

    it("ne renvoie jamais le mot de passe ni le code de vérification", async () => {
        const res = await login();

        expect(res.body.data.password).toBeUndefined();
        expect(res.body.data.verification_code).toBeUndefined();
        expect(res.body.data.id).toBeUndefined();
    });

    it('accepte un email avec une casse différente', async () => {
        const res = await login(defaultUser.email.toUpperCase());

        expect(res.status).toBe(200);
    });

    it('rejette un mauvais mot de passe', async () => {
        const res = await login(defaultUser.email, 'mauvais123');

        expect(res.status).toBe(400);
    });

    it('rejette un compte inexistant', async () => {
        const res = await login('inconnu@example.com');

        expect(res.status).toBe(400);
    });

    it.each(['blocked', 'deleted'])('refuse la connexion à un compte %s', async (status) => {
        const user = await db.User.findOne({ where: { email: defaultUser.email } });
        await user.update({ status });

        const res = await login();

        expect(res.status).toBe(403);
    });
});

describe('GET /profile', () => {
    it('renvoie le profil avec un token valide', async () => {
        const { accessToken } = await createLoggedInUser();

        const res = await authed('get', '/profile', accessToken);

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(defaultUser.email);
    });

    it("masque l'id interne et le code de vérification", async () => {
        const { accessToken } = await createLoggedInUser();

        const res = await authed('get', '/profile', accessToken);

        expect(res.body.user.id).toBeUndefined();
        expect(res.body.user.verification_code).toBeUndefined();
    });

    it('renvoie 401 sans entête Authorization', async () => {
        const res = await request(app).get(`${AUTH}/profile`);

        expect(res.status).toBe(401);
    });

    it('renvoie 401 sur un token malformé', async () => {
        const res = await authed('get', '/profile', 'abc.def.ghi');

        expect(res.status).toBe(401);
    });

    it("renvoie 401 quand l'entête n'est pas au format Bearer", async () => {
        const { accessToken } = await createLoggedInUser();

        const res = await request(app).get(`${AUTH}/profile`).set('Authorization', accessToken);

        expect(res.status).toBe(401);
    });

    it("renvoie 401 quand le compte n'existe plus", async () => {
        const { accessToken, user } = await createLoggedInUser();
        await user.destroy();

        const res = await authed('get', '/profile', accessToken);

        // Régression : req.user restait null et le contrôleur plantait en 500
        expect(res.status).toBe(401);
    });
});

describe('PUT /update-profile', () => {
    it('met à jour les champs autorisés', async () => {
        const { accessToken, user } = await createLoggedInUser();

        const res = await authed('put', '/update-profile', accessToken)
            .send({ nom: 'Traore', prenoms: 'Ousmane', address: 'Abidjan' });

        expect(res.status).toBe(200);
        await user.reload();
        expect(user.nom).toBe('Traore');
        expect(user.address).toBe('Abidjan');
    });

    it('renvoie 401 sans token', async () => {
        const res = await request(app).put(`${AUTH}/update-profile`).send({ nom: 'X', prenoms: 'Y' });

        expect(res.status).toBe(401);
    });
});

describe('routes inconnues', () => {
    it('renvoie un 404 avec le bon code HTTP', async () => {
        const res = await request(app).get('/route/inexistante');

        // Régression : renvoyait un HTTP 200 avec une charge utile « 403 »
        expect(res.status).toBe(404);
        expect(res.body.response.status).toBe(false);
    });
});
