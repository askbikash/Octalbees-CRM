const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendBulkEmail } = require('../utils/email');

// Get all templates
const getTemplates = async (req, res) => {
  try {
    const { audience, category, search } = req.query;
    const where = {};

    if (audience) where.audience = audience;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      include: { creator: { select: { id: true, name: true } } },
      orderBy: [{ audience: 'asc' }, { category: 'asc' }, { created_at: 'desc' }],
    });

    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};

// Get single template
const getTemplateById = async (req, res) => {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: req.params.id },
      include: { creator: { select: { id: true, name: true } } },
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, data: template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
};

// Create template
const createTemplate = async (req, res) => {
  try {
    const { name, audience, category, subject, body, variables } = req.body;

    if (!name || !audience || !category || !subject || !body) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        audience,
        category,
        subject,
        body,
        variables: variables || null,
        created_by: req.user.id,
      },
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
};

// Update template
const updateTemplate = async (req, res) => {
  try {
    const { name, audience, category, subject, body, variables, is_active } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(audience !== undefined && { audience }),
        ...(category !== undefined && { category }),
        ...(subject !== undefined && { subject }),
        ...(body !== undefined && { body }),
        ...(variables !== undefined && { variables }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json({ success: true, data: template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
};

// Delete template
const deleteTemplate = async (req, res) => {
  try {
    const template = await prisma.emailTemplate.findUnique({ where: { id: req.params.id } });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (template.is_default) {
      return res.status(403).json({ success: false, message: 'Cannot delete default templates' });
    }

    await prisma.emailTemplate.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
};

// Send Email using template content
const sendEmail = async (req, res) => {
  try {
    const { to, subject, htmlBody, leadId } = req.body;
    
    if (!to || !subject || !htmlBody) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let emailLog = { id: 'generic', to_email: to, subject };

    if (leadId) {
      emailLog = await prisma.emailLog.create({
        data: {
          lead_id: leadId,
          to_email: to,
          subject,
          sent_by: req.user.id,
          status: 'SENT'
        }
      });
      
      await prisma.activity.create({
        data: {
          lead_id: leadId,
          user_id: req.user.id,
          type: 'EMAIL',
          description: `Sent email: ${subject}`
        }
      });
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    // Use existing bulk email utility which handles both local SMTP and prod Vercel proxy
    await sendBulkEmail([emailLog], htmlBody, req.user.name, backendUrl);
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
};

module.exports = { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, sendEmail };
