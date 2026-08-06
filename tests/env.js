// Chargé par Jest (setupFiles) avant tout autre module : les variables
// doivent être posées avant que src/models n'instancie Sequelize.
// dotenv n'écrase pas les variables déjà définies, un .env local reste donc
// sans effet sur les tests.
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.DB_LOGGING = 'false';

process.env.JWT_SECRET = 'test-secret-not-used-in-production';
process.env.JWT_ACCESS_EXPIRATION_MINUTES = '30';
process.env.JWT_REFRESH_EXPIRATION_DAYS = '30';

process.env.APP_NAME = 'STARTER KIT TEST';
process.env.FROM_NAME = 'STARTER KIT TEST';
process.env.FROM_EMAIL = 'no-reply@example.com';
process.env.APP_IMAGE_URL = 'https://example.com/logo.svg';
process.env.CURRENT_YEAR = '2026';
process.env.SUPPORT_EMAIL = 'support@example.com';
