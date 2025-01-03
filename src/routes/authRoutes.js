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
    updateProfil,
    sendMobileResetPasswordCode,
    confirmTel
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
    refreshTokenValidator,
    confirmTelValidator,
    sendMobileResetPasswordCodeValidator
} = require('../validator/authValidator');


// Auth Routes
authRoutes.post('/register', registerValidator, register);
authRoutes.post('/login',loginValidator, login);
authRoutes.post('/logout', refreshTokenValidator, logout);
authRoutes.get('/profile', protect, getMe);
authRoutes.put('/update-profile', protect,updateProfilValidator, updateProfil);
authRoutes.post('/refresh-token', refreshTokenValidator, refreshTokens);
authRoutes.put('/change-password', protect, changePasswordValidator, changePassword,);
authRoutes.post('/confirm-email', protect, confirmEmailValidator, confirmEmail,);
authRoutes.post('/confirm-tel', protect, confirmTelValidator, confirmTel,);
authRoutes.post('/reset-password', sendResetPasswordCodeValidator, sendResetPasswordCode,);
authRoutes.post('/mobile-reset-password', sendMobileResetPasswordCodeValidator, sendMobileResetPasswordCode,);
authRoutes.put('/confirm-password', confirmPasswordCodeValidator, confirmPasswordCode,);
// 1. Send code to user 
// 2. post code to update password and confirm password
module.exports = authRoutes;