const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const serializeUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || '',
        whatsappNumber: user.whatsappNumber || '',
        isVerified: !!user.isVerified
    };
};

const normalizeWhatsappNumber = (value = '') => {
    return String(value || '').replace(/\D/g, '').slice(0, 15);
};

const sanitizeProfilePhoto = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const trimmed = String(value || '').trim();

    if (!trimmed) {
        return '';
    }

    const isDataImage = /^data:image\/(?:png|jpe?g|webp|gif|svg\+xml);base64,/i.test(trimmed);
    const isRemoteImage = /^https?:\/\//i.test(trimmed);

    if (!isDataImage && !isRemoteImage) {
        throw new Error('Please upload a valid profile image.');
    }

    if (trimmed.length > 8 * 1024 * 1024) {
        throw new Error('Profile photo is too large. Please use a smaller image.');
    }

    return trimmed;
};

// @desc    Register a user (Sends OTP)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
        }

        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ success: false, message: 'User already exists and is verified. Please log in.' });
            }
            // If user exists but not verified, we can update their details and resend OTP
            user.name = name;
            user.password = password; // pre-save will hash it if modified
        } else {
            user = new User({ name, email, password, isVerified: false });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.signupOtp = otp;
        user.signupOtpExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'Account Verification OTP - Thanathu Madom Devasthanam',
                message: `Your OTP for account verification is: \n\n ${otp} \n\n It is valid for 10 minutes.`,
            });
            res.status(200).json({ success: true, message: 'OTP sent to your email for verification.' });
        } catch (error) {
            console.error('Signup OTP email send failed:', error.message);
            user.signupOtp = undefined;
            user.signupOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please check backend email configuration and try again.'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Signup OTP
// @route   POST /api/auth/verify-signup
exports.verifySignup = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            signupOtp: otp,
            signupOtpExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.signupOtp = undefined;
        user.signupOtpExpire = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            token,
            message: 'Account verified successfully',
            user: serializeUser(user)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email first. Sign up again to receive a new OTP.', needsVerification: true });
        }

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/user/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user: serializeUser(user) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, whatsappNumber, profilePhoto } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const nextName = typeof name === 'string' ? name.trim() : user.name;

        if (!nextName) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        user.name = nextName;
        user.whatsappNumber = whatsappNumber !== undefined
            ? normalizeWhatsappNumber(whatsappNumber)
            : user.whatsappNumber;

        if (profilePhoto !== undefined) {
            user.profilePhoto = sanitizeProfilePhoto(profilePhoto);
        }

        await user.save();
        res.status(200).json({ success: true, user: serializeUser(user) });
    } catch (error) {
        if (
            error.message === 'Please upload a valid profile image.' ||
            error.message === 'Profile photo is too large. Please use a smaller image.'
        ) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password (Generate OTP)
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP - Thanathu Madom Devasthanam',
                message: `Your OTP for password reset is: \n\n ${otp} \n\n It is valid for 10 minutes. If you did not request this, please ignore this email.`,
            });
            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } catch (error) {
            console.error('Password reset OTP email send failed:', error.message);
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please check backend email configuration and try again.'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordOtpExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.password = password;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            token,
            message: 'Password reset successful',
            user: serializeUser(user)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// kid
