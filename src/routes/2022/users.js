const users = require('express').Router()
const { indexUser, getUser } = require('../../controllers/2022/UserController')





users.get('/', indexUser)
users.get('/one', getUser)


module.exports = users