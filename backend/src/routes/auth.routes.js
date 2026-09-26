const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, getMe } = require('../controllers/auth.controller');
const { forgotPassword, verifySecurity, verifyOTP, resetPassword } = require('../controllers/password.controller');
const { sendOTPEmail } = require('../utils/email');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Strict rate limit on login to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 1 minute.' }
});

// Rate limit for password reset to prevent abuse
const resetLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again after 5 minutes.' }
});

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, getMe);

// Password reset flow
router.post('/forgot-password', resetLimiter, forgotPassword);
router.post('/verify-security', resetLimiter, verifySecurity);
router.post('/verify-otp', resetLimiter, verifyOTP);
router.post('/reset-password', resetLimiter, resetPassword);

router.get('/test-email', async (req, res) => {
  try {
    await sendOTPEmail(process.env.SMTP_EMAIL || 'test@example.com', '123456', 'Debug Test');
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.json({ success: false, error: error.message, stack: error.stack, code: error.code });
  }
});

module.exports = router;
