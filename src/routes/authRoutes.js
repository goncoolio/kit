const authRoutes = require('express').Router()
const { 
    register,
    login, 
    logout, 
    getMe, 
    refreshTokens, 
    changePassword, 
    confirmEmail, 
    sendResetPasswordCode, 
    confirmPasswordCode, 
    updateProfil
} = require('../controllers/auth/Auth.Controller');
const { protect } = require('../middleware/authMiddleware');
const { 
    loginValidator,
    changePasswordValidator, 
    registerValidator, 
    confirmEmailValidator, 
    sendResetPasswordCodeValidator, 
    confirmPasswordCodeValidator, 
    updateProfilValidator,
    refreshTokenValidator
} = require('../validator/authValidator');


// Auth Routes
authRoutes.post('/register', registerValidator, register);
authRoutes.post('/login',loginValidator, login);
authRoutes.post('/logout', refreshTokenValidator, logout);
authRoutes.get('/profile', protect, getMe);
authRoutes.post('/update-profile', protect,updateProfilValidator, updateProfil);
authRoutes.post('/refresh-token', protect, refreshTokenValidator, refreshTokens);
authRoutes.put('/change-password', protect, changePasswordValidator, changePassword,);
authRoutes.put('/confirm-email', protect, confirmEmailValidator, confirmEmail,);
authRoutes.post('/reset-password', sendResetPasswordCodeValidator, sendResetPasswordCode,);
authRoutes.put('/confirm-password', confirmPasswordCodeValidator, confirmPasswordCode,);
// 1. Send code to user 
// 2. post code to update password and confirm password
module.exports = authRoutes;