const nodemailer = require('nodemailer');
const dns = require('dns').promises;

// Create reusable transporter using Gmail SMTP
const createTransporter = async () => {
  // Manually resolve IPv4 address because Render IPv6 fails
  const lookup = await dns.lookup('smtp.gmail.com', { family: 4 });
  
  return nodemailer.createTransport({
    host: lookup.address, // Use explicit IPv4 address
    port: 587,
    secure: false, 
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD, 
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send OTP email for password reset
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name for personalization
 */
const sendOTPEmail = async (to, otp, userName) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Octalbees CRM" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Password Reset OTP - Octalbees CRM',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background: #0f0a1f; border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.2);">
        <div style="padding: 40px 32px 24px; text-align: center; background: linear-gradient(135deg, #1e0a3c 0%, #2d1065 100%);">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Octalbees CRM</h1>
          <p style="color: #a78bfa; font-size: 14px; margin: 0;">Password Reset Request</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Hi <strong style="color: #fff;">${userName}</strong>,<br/>
            Use the following OTP to reset your password. This code is valid for <strong style="color: #a78bfa;">10 minutes</strong>.
          </p>
          <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #ffffff; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
            If you didn't request this reset, please ignore this email. Your account remains secure.
          </p>
        </div>
        <div style="padding: 16px 32px; border-top: 1px solid rgba(139, 92, 246, 0.15); text-align: center;">
          <p style="color: #6b7280; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Octalbees · Enterprise CRM</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { sendOTPEmail, generateOTP };
