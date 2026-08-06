// Test d'intégration : sendEmail est exercé contre un vrai serveur SMTP local,
// sans mock, pour valider la compilation du template handlebars et le transport.
const { SMTPServer } = require('smtp-server');

let server;
let port;
let received;

// Décode le corps du message selon son encodage de transfert
const decodeBody = (raw) => {
    const base64 = raw.match(/Content-Transfer-Encoding: base64\r?\n\r?\n([\s\S]+?)(\r?\n--|$)/);
    if (base64) {
        return Buffer.from(base64[1].replace(/\r?\n/g, ''), 'base64').toString('utf8');
    }
    return raw
        .replace(/=\r?\n/g, '')
        .replace(/=([0-9A-F]{2})/g, (m, hex) => Buffer.from(hex, 'hex').toString('binary'));
};

beforeAll(async () => {
    server = new SMTPServer({
        authOptional: true,
        disabledCommands: ['STARTTLS'],
        onAuth(auth, session, callback) {
            callback(null, { user: auth.username });
        },
        onData(stream, session, callback) {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => {
                received = {
                    raw: Buffer.concat(chunks).toString('utf8'),
                    recipients: session.envelope.rcptTo.map((r) => r.address),
                };
                callback();
            });
        },
    });

    // Port éphémère : évite tout conflit avec un service local
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = server.server.address().port;
});

afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
    received = undefined;
    process.env.SMTP_HOST = '127.0.0.1';
    process.env.SMTP_PORT = String(port);
    delete process.env.SMTP_EMAIL;
    delete process.env.SMTP_PASSWORD;
});

const { sendEmail } = require('../src/Email/sendEmail');

describe('sendEmail', () => {
    it('remet le message au serveur SMTP', async () => {
        await sendEmail({
            email: 'destinataire@example.com',
            subject: 'Confirmez votre inscription',
            message: "Code de verification d'email",
            email_verification_code: '1234567',
        });

        expect(received).toBeDefined();
        expect(received.recipients).toContain('destinataire@example.com');
    });

    it('compile le template handlebars avec ses variables', async () => {
        await sendEmail({
            email: 'destinataire@example.com',
            subject: 'Confirmez votre inscription',
            message: "Code de verification d'email",
            email_verification_code: '1234567',
        });

        const body = decodeBody(received.raw);
        expect(body).toMatch(/<html|<body|<div|<table/i);
        expect(body).toContain('1234567');
        expect(body).toContain(process.env.APP_NAME);
    });

    it("renseigne l'expéditeur depuis la configuration", async () => {
        await sendEmail({ email: 'destinataire@example.com', subject: 'Test', message: 'x' });

        expect(received.raw).toMatch(new RegExp(`<${process.env.FROM_EMAIL}>`));
    });

    it('fonctionne avec un relais authentifié', async () => {
        process.env.SMTP_EMAIL = 'user@example.com';
        process.env.SMTP_PASSWORD = 'motdepasse';

        await sendEmail({ email: 'auth@example.com', subject: 'Avec auth', message: 'x' });

        expect(received).toBeDefined();
    });

    it("fonctionne avec un relais sans authentification", async () => {
        // Régression : le bloc auth était toujours envoyé, ce qui faisait
        // échouer les relais de développement (MailHog, Mailpit)
        await sendEmail({ email: 'sans-auth@example.com', subject: 'Sans auth', message: 'x' });

        expect(received).toBeDefined();
    });

    it('refuse un envoi sans destinataire', async () => {
        await expect(sendEmail({ subject: 'Test', message: 'x' }))
            .rejects.toThrow(/Aucun destinataire/);
    });

    it("refuse un envoi sans SMTP_HOST configuré", async () => {
        delete process.env.SMTP_HOST;

        await expect(sendEmail({ email: 'x@example.com', subject: 'Test', message: 'x' }))
            .rejects.toThrow(/SMTP_HOST/);
    });
});
