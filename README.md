# Authentication API with Node.js | API d'Authentification Node.js

[English](#english) | [Français](#français)

# English

A complete RESTful authentication API built with Node.js, Express, and MySQL.

## Features

- User registration
- Email/password login
- JWT authentication with access and refresh tokens
- Email verification
- Password reset
- Profile update
- Data validation with Joi
- Error handling
- Logging with Winston
- Email sending with Nodemailer

## Prerequisites

- Node.js (v20.17+ — required by the test toolchain)
- MySQL (v5.7+)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/goncoolio/kit.git
cd <folder-name>
```

2. Install dependencies:
```bash
npm install
```

3. Copy .env.example to .env:
```bash
cp .env.example .env
```

4. Configure environment variables in .env:
```env
# App
APP_NAME="Your App"
NODE_ENV=development
PORT=5200

# JWT
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_LIFE=30m
REFRESH_TOKEN_LIFE=30d

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=465
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
FROM_NAME="Your App"
FROM_EMAIL=no-reply@yourapp.com
```

5. Configure the database in the same .env file (no credentials are stored in the repository):
```env
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql
```

6. Create database:
```bash
npx sequelize-cli db:create
```

7. Run migrations:
```bash
npx sequelize-cli db:migrate
```

## Running the API

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Tests

The test suite runs against an in-memory SQLite database, so no MySQL server
or `.env` file is required — everything is configured in `tests/env.js`.

```bash
npm test          # run the whole suite
npm run test:watch
```

| File | Coverage |
|------|----------|
| `tests/auth.test.js` | registration, login, profile, account status, 404 handling |
| `tests/tokens.test.js` | token refresh and rotation, token typing, blacklist, logout |
| `tests/verification.test.js` | email and phone confirmation, code expiry |
| `tests/password.test.js` | password change and reset flows |
| `tests/email.test.js` | integration test of `sendEmail` against a real local SMTP server |

Emails are mocked everywhere except in `tests/email.test.js`, which starts a
local SMTP server to verify the handlebars template is really compiled and
delivered.

CI runs the suite on Node 20 and 22, and checks that migrations apply and roll
back cleanly (`.github/workflows/tests.yml`).

## API Routes

All authentication routes are mounted under `/auth/user`.

### Authentication
- `POST /auth/user/register` - Register
- `POST /auth/user/login` - Login
- `POST /auth/user/logout` - Logout (body: `refresh_token`)
- `GET /auth/user/profile` - Get profile (Bearer access token)
- `PUT /auth/user/update-profile` - Update profile (Bearer access token)
- `POST /auth/user/refresh-token` - Refresh token (body: `refresh_token`)
- `PUT /auth/user/change-password` - Change password (Bearer access token)
- `POST /auth/user/confirm-email` - Confirm email (Bearer access token)
- `POST /auth/user/confirm-tel` - Confirm mobile number (Bearer access token)
- `POST /auth/user/reset-password` - Request password reset by email
- `POST /auth/user/mobile-reset-password` - Request password reset by phone number
- `PUT /auth/user/confirm-password` - Confirm password reset

## Project Structure
```
src/
├── config/         # Configurations
├── controllers/    # Controllers
├── Email/         # Email templates
├── middleware/    # Middlewares
├── migrations/    # Database migrations
├── models/        # Sequelize models
├── routes/        # Routes
├── services/      # Services
└── validator/     # Validators
```

## Security

- Passwords hashed with bcrypt
- CORS protection
- Input data validation
- Sensitive routes protected with JWT
- Expired token handling
- Token blacklisting

## Logging

Logs are generated in the `logs/` folder with daily rotation.

---

# Français

Une API RESTful d'authentification complète construite avec Node.js, Express et MySQL.

## Fonctionnalités

- Inscription utilisateur
- Connexion avec email/mot de passe
- Authentification JWT avec tokens d'accès et de rafraîchissement
- Vérification d'email
- Réinitialisation de mot de passe
- Mise à jour du profil
- Validation des données avec Joi
- Gestion des erreurs
- Logs avec Winston
- Envoi d'emails avec Nodemailer

## Prérequis

- Node.js (v20.17+ — requis par l'outillage de test)
- MySQL (v5.7+)
- npm ou yarn

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/goncoolio/kit.git
cd <nom-du-dossier>
```

2. Installez les dépendances :
```bash
npm install
```

3. Copiez le fichier .env.example en .env :
```bash
cp .env.example .env
```

4. Configurez les variables d'environnement dans le fichier .env :
```env
# App
APP_NAME="Votre App"
NODE_ENV=development
PORT=5200

# JWT
JWT_SECRET=votre_secret_jwt
ACCESS_TOKEN_LIFE=30m
REFRESH_TOKEN_LIFE=30d

# Email
SMTP_HOST=votre_host_smtp
SMTP_PORT=465
SMTP_EMAIL=votre_email
SMTP_PASSWORD=votre_password
FROM_NAME="Votre App"
FROM_EMAIL=no-reply@votreapp.com
```

5. Configurez la base de données dans ce même fichier .env (aucun identifiant n'est stocké dans le dépôt) :
```env
DB_USERNAME=votre_username
DB_PASSWORD=votre_password
DB_DATABASE=votre_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql
```

6. Créez la base de données :
```bash
npx sequelize-cli db:create
```

7. Exécutez les migrations :
```bash
npx sequelize-cli db:migrate
```

## Démarrage

Mode développement :
```bash
npm run dev
```

Mode production :
```bash
npm start
```

## Tests

La suite de tests s'exécute sur une base SQLite en mémoire : aucun serveur
MySQL ni fichier `.env` n'est nécessaire, tout est configuré dans
`tests/env.js`.

```bash
npm test          # lance toute la suite
npm run test:watch
```

| Fichier | Couverture |
|---------|------------|
| `tests/auth.test.js` | inscription, connexion, profil, statut du compte, gestion des 404 |
| `tests/tokens.test.js` | rafraîchissement et rotation des tokens, typage, blacklist, déconnexion |
| `tests/verification.test.js` | confirmation email et téléphone, expiration des codes |
| `tests/password.test.js` | changement et réinitialisation du mot de passe |
| `tests/email.test.js` | test d'intégration de `sendEmail` contre un vrai serveur SMTP local |

Les emails sont mockés partout sauf dans `tests/email.test.js`, qui démarre un
serveur SMTP local pour vérifier que le template handlebars est réellement
compilé et remis.

La CI exécute la suite sur Node 20 et 22, et vérifie que les migrations
s'appliquent et se déroulent proprement dans les deux sens
(`.github/workflows/tests.yml`).

## Routes API

Toutes les routes d'authentification sont montées sous `/auth/user`.

### Authentification
- `POST /auth/user/register` - Inscription
- `POST /auth/user/login` - Connexion
- `POST /auth/user/logout` - Déconnexion (body : `refresh_token`)
- `GET /auth/user/profile` - Obtenir le profil (token d'accès Bearer)
- `PUT /auth/user/update-profile` - Mettre à jour le profil (token d'accès Bearer)
- `POST /auth/user/refresh-token` - Rafraîchir le token (body : `refresh_token`)
- `PUT /auth/user/change-password` - Changer le mot de passe (token d'accès Bearer)
- `POST /auth/user/confirm-email` - Confirmer l'email (token d'accès Bearer)
- `POST /auth/user/confirm-tel` - Confirmer le numéro de téléphone (token d'accès Bearer)
- `POST /auth/user/reset-password` - Demander la réinitialisation par email
- `POST /auth/user/mobile-reset-password` - Demander la réinitialisation par téléphone
- `PUT /auth/user/confirm-password` - Confirmer la réinitialisation du mot de passe

## Structure du projet
```
src/
├── config/         # Configurations
├── controllers/    # Contrôleurs
├── Email/         # Templates d'emails
├── middleware/    # Middlewares
├── migrations/    # Migrations de base de données
├── models/        # Modèles Sequelize
├── routes/        # Routes
├── services/      # Services
└── validator/     # Validateurs
```

## Sécurité

- Mots de passe hashés avec bcrypt
- Protection CORS
- Validation des données entrantes
- Protection des routes sensibles avec JWT
- Gestion des tokens expirés
- Blacklist des tokens

## Logs

Les logs sont générés dans le dossier `logs/` avec rotation quotidienne.

## Auteur

Ousmane Coulibaly

## Licence

ISC
