const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS configuration for Vercel Serverless Function
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { to, otp, userName } = req.body;

    if (!to || !otp) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD, 
      },
    });

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
              Hi <strong style="color: #fff;">${userName || 'User'}</strong>,<br/>
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
    return res.status(200).json({ success: true, message: 'OTP Email Sent' });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
}
