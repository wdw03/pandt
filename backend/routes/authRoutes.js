const express = require('express');
const {
    register,
    resendSignupOtp,
    login,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifySignup
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/resend-signup-otp', resendSignupOtp);
router.post('/verify-signup', verifySignup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
