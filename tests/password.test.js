jest.mock('../src/Email/sendEmail', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }));

const {
    AUTH, app, db, request, defaultUser,
    resetDatabase, closeDatabase, login, createLoggedInUser, authed, minutesFromNow,
} = require('./helpers');
const { sendEmail } = require('../src/Email/sendEmail');

beforeEach(async () => {
    await resetDatabase();
    sendEmail.mockClear();
});

afterAll(closeDatabase);

describe('PUT /change-password', () => {
    it('change le mot de passe et permet de se reconnecter avec', async () => {
        const { accessToken } = await createLoggedInUser();

        const res = await authed('put', '/change-password', accessToken).send({
            old_password: defaultUser.password,
            password: 'Nouveau123',
            confirm_password: 'Nouveau123',
        });

        expect(res.status).toBe(200);
        expect((await login(defaultUser.email, 'Nouveau123')).status).toBe(200);
        expect((await login(defaultUser.email, defaultUser.password)).status).toBe(400);
    });

    it("cible le compte du token, pas l'uuid fourni dans le corps", async () => {
        const victim = await createLoggedInUser();
        const attacker = await createLoggedInUser({
            email: 'attaquant@example.com', tel: '+22509080706',
        });
        const victimHash = victim.user.password;

        const res = await authed('put', '/change-password', attacker.accessToken).send({
            old_password: defaultUser.password,
            password: 'Pirate123',
            confirm_password: 'Pirate123',
            uuid: victim.user.uuid,
        });

        // L'uuid du corps est accepté par le validateur mais ignoré par le
        // service : seul le compte porteur du token est modifié
        expect(res.status).toBe(200);
        await victim.user.reload();
        expect(victim.user.password).toBe(victimHash);
        await attacker.user.reload();
        expect(attacker.user.password).not.toBe(victimHash);
    });

    it("rejette un mauvais ancien mot de passe", async () => {
        const { accessToken } = await createLoggedInUser();

        const res = await authed('put', '/change-password', accessToken).send({
            old_password: 'faux123456',
            password: 'Nouveau123',
            confirm_password: 'Nouveau123',
        });

        expect(res.status).toBe(400);
    });

    it('rejette une confirmation qui ne correspond pas', async () => {
        const { accessToken } = await createLoggedInUser();

        const res = await authed('put', '/change-password', accessToken).send({
            old_password: defaultUser.password,
            password: 'Nouveau123',
            confirm_password: 'Different123',
        });

        expect(res.status).toBe(400);
    });

    it('renvoie 401 sans token', async () => {
        await createLoggedInUser();

        const res = await request(app).put(`${AUTH}/change-password`).send({
            old_password: defaultUser.password,
            password: 'Nouveau123',
            confirm_password: 'Nouveau123',
        });

        expect(res.status).toBe(401);
    });
});

describe('POST /reset-password', () => {
    it('génère un code daté et envoie un email', async () => {
        await createLoggedInUser();

        const res = await request(app).post(`${AUTH}/reset-password`).send({ email: defaultUser.email });

        expect(res.status).toBe(200);
        const user = await db.User.findOne({ where: { email: defaultUser.email } });
        expect(user.verification_code).toMatch(/^\d{7}$/);
        expect(new Date(user.verification_code_expires_at).getTime()).toBeGreaterThan(Date.now());
        expect(sendEmail).toHaveBeenCalled();
    });

    it('rejette un compte inconnu', async () => {
        const res = await request(app).post(`${AUTH}/reset-password`).send({ email: 'inconnu@example.com' });

        expect(res.status).toBe(400);
    });

    it('rejette un email invalide', async () => {
        const res = await request(app).post(`${AUTH}/reset-password`).send({ email: 'pas-un-email' });

        expect(res.status).toBe(400);
    });
});

describe('POST /mobile-reset-password', () => {
    it('génère un code daté à partir du numéro de téléphone', async () => {
        await createLoggedInUser();

        const res = await request(app).post(`${AUTH}/mobile-reset-password`).send({ tel: defaultUser.tel });

        expect(res.status).toBe(200);
        const user = await db.User.findOne({ where: { tel: defaultUser.tel } });
        expect(user.verification_code).toMatch(/^\d{7}$/);
        expect(new Date(user.verification_code_expires_at).getTime()).toBeGreaterThan(Date.now());
    });

    it('rejette un numéro inconnu', async () => {
        const res = await request(app).post(`${AUTH}/mobile-reset-password`).send({ tel: '+22500000000' });

        expect(res.status).toBe(400);
    });

    it('rejette un numéro hors format E.164', async () => {
        const res = await request(app).post(`${AUTH}/mobile-reset-password`).send({ tel: 'abc' });

        expect(res.status).toBe(400);
    });
});

describe('PUT /confirm-password', () => {
    const confirm = (body) => request(app).put(`${AUTH}/confirm-password`).send(body);

    const requestCode = async () => {
        await request(app).post(`${AUTH}/reset-password`).send({ email: defaultUser.email });
        return db.User.findOne({ where: { email: defaultUser.email } });
    };

    beforeEach(async () => { await createLoggedInUser(); });

    it('réinitialise le mot de passe avec un code valide', async () => {
        const user = await requestCode();

        const res = await confirm({
            email: defaultUser.email,
            verification_code: user.verification_code,
            password: 'Reset12345',
            confirm_password: 'Reset12345',
        });

        expect(res.status).toBe(200);
        expect((await login(defaultUser.email, 'Reset12345')).status).toBe(200);
    });

    it('consomme le code après usage', async () => {
        const user = await requestCode();
        const code = user.verification_code;

        await confirm({
            email: defaultUser.email,
            verification_code: code,
            password: 'Reset12345',
            confirm_password: 'Reset12345',
        });

        await user.reload();
        expect(user.verification_code).toBeNull();
        expect(user.verification_code_expires_at).toBeNull();

        // Le même code ne peut pas resservir
        const res = await confirm({
            email: defaultUser.email,
            verification_code: code,
            password: 'Encore12345',
            confirm_password: 'Encore12345',
        });
        expect(res.status).toBe(400);
    });

    it('rejette un code expiré', async () => {
        const user = await requestCode();
        await user.update({ verification_code_expires_at: minutesFromNow(-1) });

        const res = await confirm({
            email: defaultUser.email,
            verification_code: user.verification_code,
            password: 'Reset12345',
            confirm_password: 'Reset12345',
        });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toMatch(/expired/i);
        expect((await login(defaultUser.email, 'Reset12345')).status).toBe(400);
    });

    it('rejette un mauvais code', async () => {
        await requestCode();

        const res = await confirm({
            email: defaultUser.email,
            verification_code: '0000000',
            password: 'Reset12345',
            confirm_password: 'Reset12345',
        });

        expect(res.status).toBe(400);
    });

    it('rejette une confirmation qui ne correspond pas', async () => {
        const user = await requestCode();

        const res = await confirm({
            email: defaultUser.email,
            verification_code: user.verification_code,
            password: 'Reset12345',
            confirm_password: 'Autre12345',
        });

        expect(res.status).toBe(400);
    });
});
