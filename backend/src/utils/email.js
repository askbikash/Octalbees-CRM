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
  // If in production on Render, use the Vercel Serverless Function to bypass Render's firewall
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL || 'https://crm.octalbees.com';
    const response = await fetch(`${frontendUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, otp, userName })
    });
    
    if (!response.ok) {
      throw new Error('Vercel email proxy failed');
    }
    return;
  }

  // Local fallback
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

/**
 * Send bulk email to multiple recipients
 */
const sendBulkEmail = async (emails, subject, message, senderName) => {
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL || 'https://crm.octalbees.com';
    const response = await fetch(`${frontendUrl}/api/send-bulk-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, subject, message, senderName })
    });
    
    if (!response.ok) throw new Error('Vercel email proxy failed');
    return;
  }

  const transporter = await createTransporter();
  const emailList = Array.isArray(emails) ? emails : [emails];
  const htmlContent = `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
  
  <!-- Body -->
  <div style="font-size: 16px; line-height: 1.6; color: #374151; font-weight: 400;">
    ${message.replace(/\n/g, '<br/>')}
  </div>
  
  <!-- Footer -->
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; text-align: left;">
    <p style="margin: 0 0 12px 0;">
      This email was sent by <strong>${senderName || 'Octalbees CRM'}</strong>.
    </p>
    <p style="margin: 0 0 12px 0;">
      <a href="mailto:info@octalbees.com" style="color: #2563eb; text-decoration: none;">Contact Support</a> &nbsp;&bull;&nbsp; 
      <a href="https://octalbees.com" style="color: #2563eb; text-decoration: none;">octalbees.com</a>
    </p>
    <p style="margin: 0;">
      &copy; ${new Date().getFullYear()} Octalbees CRM. All rights reserved.
    </p>
  </div>
  
</div>
  `;

  // Send individual emails so "To" is the lead's email
  const sendPromises = emailList.map(email => {
    return transporter.sendMail({
      from: `"${senderName || 'Octalbees CRM'}" <${process.env.SMTP_EMAIL}>`,
      to: email,
      cc: 'info@octalbees.com',
      bcc: process.env.SMTP_EMAIL, // This uses your configured SMTP email
      subject: subject,
      html: htmlContent,
    });
  });

  await Promise.all(sendPromises);
};

const sendWelcomeEmail = async (to, name, email, password, role) => {
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL || 'https://crm.octalbees.com';
    const response = await fetch(`${frontendUrl}/api/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, name, email, password, role })
    });
    
    if (!response.ok) throw new Error('Vercel email proxy failed');
    return;
  }

  const transporter = await createTransporter();
  const mailOptions = {
    from: `"Octalbees CRM" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Welcome to Octalbees CRM - Your Account Credentials',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background: #0f0a1f; border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.2);">
        <div style="padding: 40px 32px 24px; text-align: center; background: linear-gradient(135deg, #1e0a3c 0%, #2d1065 100%);">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Octalbees CRM</h1>
          <p style="color: #a78bfa; font-size: 14px; margin: 0;">Welcome to the Team!</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Hi <strong style="color: #fff;">${name}</strong>,<br/>
            An account has been created for you on Octalbees CRM as a <strong>${role}</strong>. Below are your login credentials.
          </p>
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin: 0 0 24px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 4px;">Email</p>
            <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px;">${email}</p>
            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 4px;">Temporary Password</p>
            <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace;">${password}</p>
          </div>
          <a href="https://crm.octalbees.com/" style="display: block; width: 100%; text-align: center; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #ffffff; text-decoration: none; padding: 14px 0; border-radius: 8px; font-weight: 600; margin: 0 0 24px;">Login to CRM</a>
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
            Please log in and change your password immediately for security reasons.
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

module.exports = { sendOTPEmail, generateOTP, sendBulkEmail, sendWelcomeEmail };
