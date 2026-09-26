import nodemailer from 'nodemailer';

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
    const { to, name, email, password, role } = req.body;

    if (!to || !name || !email || !password || !role) {
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

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });

  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
}
