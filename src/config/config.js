require('dotenv').config();

// La configuration est lue depuis le .env : aucun identifiant ne doit être
// committé. Les valeurs par défaut correspondent à une installation locale.
const buildConfig = (defaultDatabase) => {
    const config = {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_DATABASE || defaultDatabase,
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    };

    if (config.dialect === 'sqlite') {
        config.storage = process.env.DB_STORAGE || ':memory:';
    }

    return config;
};

module.exports = {
    development: buildConfig('starter_kit_dev'),
    test: buildConfig('starter_kit_test'),
    production: buildConfig('starter_kit_production'),
};
