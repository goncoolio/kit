const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');


const sendEmail = async (options) => {
  // 1. Créer un transporter
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  if (!options.email) {
    throw new Error('Aucun destinataire défini pour l\'email');
}

    transporter.use(
        "compile",
        hbs({
            viewEngine: {
            extName: ".handlebars",
            partialsDir: path.join(__dirname, './templates'),
            layoutsDir: path.join(__dirname, './templates'),
            defaultLayout: "",
            },
            viewPath: path.join(__dirname, './templates'),
            extName: ".handlebars",
        })
    );
  // 2. Définir les options de l'email
  let message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    // text: options.message
    template: 'template',
    context: {  // Les données à passer au template
        email_title: options.subject,
        email_content: options.message,
        email_verification_code: options.email_verification_code,
        logo_url: process.env.APP_IMAGE_URL,
        app_name: process.env.APP_NAME,
        current_year: process.env.CURRENT_YEAR,
        support_email: process.env.SUPPORT_EMAIL,
    }
  };

  // 3. Envoyer l'email
  await transporter.sendMail(message);
};

module.exports = {
    sendEmail,
}