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
    const { emails, subject, message, senderName } = req.body;

    if (!emails || !subject || !message) {
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
    return res.status(200).json({ success: true, message: 'Bulk Emails Sent' });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send emails', error: error.message });
  }
}
