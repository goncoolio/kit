jest.mock('../src/Email/sendEmail', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }));

const { sendEmail } = require('../src/Email/sendEmail');
const {
    resetDatabase, closeDatabase, createLoggedInUser, authed, register, minutesFromNow,
} = require('./helpers');

let accessToken;
let user;

beforeEach(async () => {
    sendEmail.mockReset();
    sendEmail.mockResolvedValue(true);
    await resetDatabase();
    ({ accessToken, user } = await createLoggedInUser());
});

afterAll(closeDatabase);

// Le client construit son affichage (badges de vérification, rôle) à partir de
// ces champs : s'ils manquent de la réponse, il les efface de son état.
describe('payload de profil', () => {
    it("expose le rôle, le statut et les dates de vérification à l'inscription", async () => {
        const res = await register({ email: 'second.user@example.com', tel: '+22509080706' });

        expect(res.status).toBe(201);
        expect(res.body.data.role).toBe('user');
        expect(res.body.data).toHaveProperty('status');
        expect(res.body.data).toHaveProperty('email_verified_at');
        expect(res.body.data).toHaveProperty('tel_verified_at');
    });

    it('expose les mêmes champs après une mise à jour de profil', async () => {
        const res = await authed('put', '/update-profile', accessToken)
            .send({ nom: 'Nouveau', prenoms: 'Nom', address: 'Abidjan' });

        expect(res.status).toBe(200);
        expect(res.body.response.data.role).toBe('user');
        expect(res.body.response.data).toHaveProperty('email_verified_at');
        expect(res.body.response.data).toHaveProperty('tel_verified_at');
    });
});

// Ces emails partent une fois le changement écrit en base : les faire échouer
// ferait répondre en erreur alors que l'opération a bien eu lieu.
describe('notifications non bloquantes', () => {
    const armCode = () => user.update({
        verification_code: '1234567',
        verification_code_expires_at: minutesFromNow(5),
    });

    it("confirme l'email même si l'envoi de la notification échoue", async () => {
        await armCode();
        sendEmail.mockRejectedValue(new Error('SMTP indisponible'));

        const res = await authed('post', '/confirm-email', accessToken)
            .send({ verification_email_code: 1234567 });

        expect(res.status).toBe(200);
        await user.reload();
        expect(user.email_verified_at).not.toBeNull();
    });

    it('confirme le téléphone même si l\'envoi de la notification échoue', async () => {
        await armCode();
        sendEmail.mockRejectedValue(new Error('SMTP indisponible'));

        const res = await authed('post', '/confirm-tel', accessToken)
            .send({ verification_tel_code: 1234567 });

        expect(res.status).toBe(200);
        await user.reload();
        expect(user.tel_verified_at).not.toBeNull();
    });
});
