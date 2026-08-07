jest.mock('../src/Email/sendEmail', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }));

const {
    db, resetDatabase, closeDatabase, createLoggedInUser, authed, minutesFromNow,
} = require('./helpers');

let accessToken;
let user;

beforeEach(async () => {
    await resetDatabase();
    ({ accessToken, user } = await createLoggedInUser());
});

afterAll(closeDatabase);

// Positionne un code de vérification avec l'expiration voulue
const setCode = (code, expiresInMinutes) => user.update({
    verification_code: code,
    verification_code_expires_at: expiresInMinutes === null ? null : minutesFromNow(expiresInMinutes),
});

describe('POST /confirm-email', () => {
    it('valide un code correct et horodate la vérification', async () => {
        await setCode('1234567', 5);

        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 1234567 });

        expect(res.status).toBe(200);
        await user.reload();
        expect(user.email_verified_at).not.toBeNull();
    });

    it('consomme le code et son expiration', async () => {
        await setCode('1234567', 5);

        await authed('post', '/confirm-email', accessToken).send({ verification_email_code: 1234567 });

        await user.reload();
        expect(user.verification_code).toBeNull();
        expect(user.verification_code_expires_at).toBeNull();
    });

    it('rejette un mauvais code', async () => {
        await setCode('1234567', 5);

        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 7654321 });

        expect(res.status).toBe(400);
        await user.reload();
        expect(user.email_verified_at).toBeNull();
    });

    it('rejette un code expiré', async () => {
        await setCode('1234567', -1);

        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 1234567 });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toMatch(/expired/i);
    });

    it("rejette un code sans date d'expiration", async () => {
        await setCode('1234567', null);

        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 1234567 });

        // Comptes créés avant l'ajout de la colonne : on échoue côté fermé
        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toMatch(/expired/i);
    });

    it("rejette la confirmation quand aucun code n'a été demandé", async () => {
        await user.update({ verification_code: null, verification_code_expires_at: null });

        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 1234567 });

        expect(res.status).toBe(400);
    });

    it("ne prolonge pas la validité du code lors d'une mise à jour du profil", async () => {
        await setCode('1234567', -1);

        // Régression : l'expiration s'appuyait sur updatedAt, donc toute
        // écriture sur la ligne repoussait la validité du code
        await authed('put', '/update-profile', accessToken)
            .send({ nom: 'Traore', prenoms: 'Ousmane', address: 'Abidjan' });

        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 1234567 });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toMatch(/expired/i);
    });

    it('renvoie 401 sans token', async () => {
        const res = await authed('post', '/confirm-email', 'invalide')
            .send({ verification_email_code: 1234567 });

        expect(res.status).toBe(401);
    });

    it('rejette un code hors format', async () => {
        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 12 });

        expect(res.status).toBe(400);
    });
});

describe('POST /confirm-tel', () => {
    it('valide un code correct et horodate tel_verified_at', async () => {
        await setCode('7654321', 5);

        const res = await authed('post', '/confirm-tel', accessToken)
            .send({ verification_tel_code: 7654321 });

        // Régression : l'endpoint plantait (service non importé), lisait le
        // mauvais champ et écrivait dans email_verified_at
        expect(res.status).toBe(200);
        await user.reload();
        expect(user.tel_verified_at).not.toBeNull();
        expect(user.email_verified_at).toBeNull();
    });

    it('consomme le code et son expiration', async () => {
        await setCode('7654321', 5);

        await authed('post', '/confirm-tel', accessToken).send({ verification_tel_code: 7654321 });

        await user.reload();
        expect(user.verification_code).toBeNull();
        expect(user.verification_code_expires_at).toBeNull();
    });

    it('rejette un mauvais code', async () => {
        await setCode('7654321', 5);

        const res = await authed('post', '/confirm-tel', accessToken)
            .send({ verification_tel_code: 1111111 });

        expect(res.status).toBe(400);
    });

    it('rejette un code expiré', async () => {
        await setCode('7654321', -1);

        const res = await authed('post', '/confirm-tel', accessToken)
            .send({ verification_tel_code: 7654321 });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toMatch(/expired/i);
    });
});

describe("génération des codes à l'inscription", () => {
    it('pose un code à 7 chiffres et une expiration dans le futur', async () => {
        const fresh = await db.User.findOne({ where: { email: user.email } });

        expect(fresh.verification_code).toMatch(/^\d{7}$/);
        expect(new Date(fresh.verification_code_expires_at).getTime()).toBeGreaterThan(Date.now());
    });
});
