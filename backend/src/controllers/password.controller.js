const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { z } = require('zod');
const { sendOTPEmail, generateOTP } = require('../utils/email');

// ─── Step 1: Check email & return security question ───
const forgotPassword = async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, security_question: true, is_active: true }
    });

    if (!user || !user.is_active) {
      return res.status(404).json({ success: false, message: 'No active account found with this email.' });
    }

    if (!user.security_question) {
      return res.status(400).json({ success: false, message: 'Security question not set. Contact your admin to reset your password.' });
    }

    res.json({
      success: true,
      data: {
        email: user.email,
        security_question: user.security_question
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── Step 2: Verify security answer & send OTP ───
const verifySecurity = async (req, res) => {
  try {
    const { email, answer } = z.object({
      email: z.string().email(),
      answer: z.string().min(1, 'Answer is required')
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, security_answer: true, is_active: true }
    });

    if (!user || !user.is_active) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Compare answer (case-insensitive)
    const isCorrect = user.security_answer &&
      user.security_answer.trim().toLowerCase() === answer.trim().toLowerCase();

    if (!isCorrect) {
      return res.status(401).json({ success: false, message: 'Incorrect security answer. Please try again.' });
    }

    // Generate OTP and save to DB
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: {
        reset_otp: await bcrypt.hash(otp, 10), // Store hashed OTP
        otp_expires_at: otpExpiresAt
      }
    });

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: 'OTP sent to your email address.',
      data: { email: user.email }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid input.' });
    }
    console.error('Verify security error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// ─── Step 3: Verify OTP ───
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = z.object({
      email: z.string().email(),
      otp: z.string().length(6, 'OTP must be 6 digits')
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, reset_otp: true, otp_expires_at: true }
    });

    if (!user || !user.reset_otp) {
      return res.status(400).json({ success: false, message: 'No OTP request found. Please start over.' });
    }

    // Check if OTP expired
    if (user.otp_expires_at && new Date() > user.otp_expires_at) {
      await prisma.user.update({
        where: { email },
        data: { reset_otp: null, otp_expires_at: null }
      });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, user.reset_otp);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP is valid — generate a temporary reset token (reuse the OTP hash as a short-lived token)
    res.json({
      success: true,
      message: 'OTP verified successfully.',
      data: { email, resetToken: user.reset_otp } // Frontend will send this back with the new password
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid OTP format.' });
    }
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── Step 4: Reset Password ───
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = z.object({
      email: z.string().email(),
      resetToken: z.string().min(1),
      newPassword: z.string().min(6, 'Password must be at least 6 characters')
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, reset_otp: true, otp_expires_at: true }
    });

    if (!user || !user.reset_otp) {
      return res.status(400).json({ success: false, message: 'Invalid reset request. Please start over.' });
    }

    // Verify the reset token matches
    if (user.reset_otp !== resetToken) {
      return res.status(401).json({ success: false, message: 'Invalid reset token.' });
    }

    // Check expiry (give extra 5 min grace for password entry)
    if (user.otp_expires_at && new Date() > new Date(user.otp_expires_at.getTime() + 5 * 60 * 1000)) {
      await prisma.user.update({
        where: { email },
        data: { reset_otp: null, otp_expires_at: null }
      });
      return res.status(400).json({ success: false, message: 'Session expired. Please start over.' });
    }

    // Hash new password and update
    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password_hash,
        reset_otp: null,
        otp_expires_at: null
      }
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Invalid input.' });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { forgotPassword, verifySecurity, verifyOTP, resetPassword };
