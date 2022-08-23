const r2023 = require('express').Router();

const users = require('./users')

r2023.use('/users/', users)

module.exports = r2023