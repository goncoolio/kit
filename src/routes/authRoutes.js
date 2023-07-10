const authRoutes = require('express').Router()
const { register, login, logout, getMe, refreshTokens, changePassword } = require('../controllers/auth/Auth.Controller');
const { protect } = require('../middleware/authMiddleware');


// Auth Routes
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/profile', protect, getMe);
authRoutes.post('/refresh-token', refreshTokens);
authRoutes.put('/change-password', protect, // userValidator.changePasswordValidator,
    changePassword,
);

module.exports = authRoutes;