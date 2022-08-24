const users = require('express').Router()
const { register, login, getMe } = require('../../controllers/2022/UserController')
const { protect } = require('../../middleware/authMiddleware')


users.post('/register', register)
users.post('/login', login)
users.get('/profile', protect, getMe)

module.exports = users