const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, getMe } = require('../controllers/auth.controller');
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

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, getMe);

module.exports = router;
