const authRoutes = require('express').Router()
const { register, login, logout, getMe, refreshTokens, changePassword } = require('../controllers/auth/Auth.Controller');
const { protect } = require('../middleware/authMiddleware');
const { loginValidator, changePasswordValidator, registerValidator } = require('../validator/authValidator');


// Auth Routes
authRoutes.post('/register', registerValidator, register);
authRoutes.post('/login',loginValidator, login);
authRoutes.post('/logout', logout);
authRoutes.get('/profile', protect, getMe);
authRoutes.post('/refresh-token', protect, refreshTokens);
authRoutes.put('/change-password', protect, changePasswordValidator, changePassword,);

module.exports = authRoutes;