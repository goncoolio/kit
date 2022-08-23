const r2022 = require('express').Router();
const users = require('./users')

//  User
r2022.use('/users/', users)

module.exports = r2022