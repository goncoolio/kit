const request = require('supertest');
const app = require('../index');
const db = require('../src/models');

const AUTH = '/auth/user';

// Compte de test par défaut
const defaultUser = {
    nom: 'Coulibaly',
    prenoms: 'Ousmane',
    email: 'test.user@example.com',
    tel: '+22501020304',
    password: 'Secret123',
};

// Base neuve avant chaque fichier de test (SQLite en mémoire)
const resetDatabase = async () => {
    await db.sequelize.sync({ force: true });
};

const closeDatabase = async () => {
    await db.sequelize.close();
};

const register = (overrides = {}) => {
    return request(app).post(`${AUTH}/register`).send({ ...defaultUser, ...overrides });
};

const login = (email = defaultUser.email, password = defaultUser.password) => {
    return request(app).post(`${AUTH}/login`).send({ email, password });
};

// Inscrit un compte et renvoie ses tokens et son enregistrement en base
const createLoggedInUser = async (overrides = {}) => {
    const res = await register(overrides);
    const email = (overrides.email ?? defaultUser.email).toLowerCase();
    const user = await db.User.findOne({ where: { email } });

    return {
        user,
        accessToken: res.body.tokens.access.token,
        refreshToken: res.body.tokens.refresh.token,
    };
};

const authed = (method, url, token) => {
    return request(app)[method](`${AUTH}${url}`).set('Authorization', `Bearer ${token}`);
};

const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60000);

module.exports = {
    AUTH,
    app,
    db,
    request,
    defaultUser,
    resetDatabase,
    closeDatabase,
    register,
    login,
    createLoggedInUser,
    authed,
    minutesFromNow,
};
