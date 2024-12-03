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

- Node.js (v14+)
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

5. Configure database in src/config/config.json:
```json
{
  "development": {
    "username": "your_username",
    "password": "your_password",
    "database": "your_db",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
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

## API Routes

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/refresh-token` - Refresh token
- `PUT /api/auth/change-password` - Change password
- `PUT /api/auth/confirm-email` - Confirm email
- `POST /api/auth/reset-password` - Request password reset
- `PUT /api/auth/confirm-password` - Confirm password reset
- `POST /api/auth/update-profile` - Update profile

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

- Node.js (v14+)
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

5. Configurez la base de données dans src/config/config.json :
```json
{
  "development": {
    "username": "votre_username",
    "password": "votre_password",
    "database": "votre_db",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
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

## Routes API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/profile` - Obtenir le profil
- `POST /api/auth/refresh-token` - Rafraîchir le token
- `PUT /api/auth/change-password` - Changer le mot de passe
- `PUT /api/auth/confirm-email` - Confirmer l'email
- `POST /api/auth/reset-password` - Demander la réinitialisation du mot de passe
- `PUT /api/auth/confirm-password` - Confirmer la réinitialisation du mot de passe
- `POST /api/auth/update-profile` - Mettre à jour le profil

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
