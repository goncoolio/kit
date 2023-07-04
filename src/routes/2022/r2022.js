const r2022 = require('express').Router();
const user = require('./users')

//  User
r2022.use('/user/', user)

module.exports = r2022