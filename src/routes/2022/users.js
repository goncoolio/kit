const user = require('express').Router()
const { register, login, logout, getMe } = require('../../controllers/auth/Auth.Controller')
const { protect } = require('../../middleware/authMiddleware')


user.post('/register', register);
user.post('/login', login);
user.post('/logout', logout);
user.get('/profile', protect, getMe);

module.exports = user