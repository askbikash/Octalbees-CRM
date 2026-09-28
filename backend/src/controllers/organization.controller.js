const prisma = require('../config/prisma');
const { z } = require('zod');

const organizationSchema = z.object({
  name: z.string().min(2),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(['ORGANIZATION', 'UNIVERSITY', 'INSTITUTE', 'TRAINING_INSTITUTE', 'OTHER']).optional(),
  notes: z.string().optional()
});

const createOrganization = async (req, res) => {
  try {
    const validatedData = organizationSchema.parse(req.body);
    const organization = await prisma.organization.create({
      data: {
        ...validatedData,
        created_by: req.user.id
      }
    });
    res.status(201).json({ success: true, message: 'Organization created successfully', data: organization });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive'
      }
    } : {};

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.organization.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: organizations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: { leads: true } // V1 includes leads linked to this organization
    });

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.status(200).json({ success: true, data: organization });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    const existingOrganization = await prisma.organization.findUnique({ where: { id } });
    if (!existingOrganization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    
    if (req.user.role !== 'ADMIN' && existingOrganization.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only edit organizations you created.' });
    }

    const validatedData = organizationSchema.partial().parse(req.body);

    const organization = await prisma.organization.update({
      where: { id },
      data: validatedData
    });

    res.status(200).json({ success: true, message: 'Organization updated successfully', data: organization });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if organization has associated leads
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { leads: true } } }
    });

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    if (req.user.role !== 'ADMIN' && organization.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only delete organizations you created.' });
    }

    if (organization._count.leads > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete organization with active leads' });
    }

    await prisma.organization.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// --- ORGANIZATION CONTACTS ---

const contactSchema = z.object({
  name: z.string().min(2),
  designation: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  is_primary: z.boolean().optional()
});

const getOrganizationContacts = async (req, res) => {
  try {
    const contacts = await prisma.organizationContact.findMany({
      where: { organization_id: req.params.id },
      orderBy: [
        { is_primary: 'desc' },
        { created_at: 'desc' }
      ]
    });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addOrganizationContact = async (req, res) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    
    // If setting as primary, unset other primary contacts for this organization
    if (validatedData.is_primary) {
      await prisma.organizationContact.updateMany({
        where: { organization_id: req.params.id, is_primary: true },
        data: { is_primary: false }
      });
    }

    const contact = await prisma.organizationContact.create({
      data: {
        ...validatedData,
        organization_id: req.params.id
      }
    });
    res.status(201).json({ success: true, message: 'Contact added successfully', data: contact });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOrganizationContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const validatedData = contactSchema.partial().parse(req.body);

    // If setting as primary, unset other primary contacts for this organization
    if (validatedData.is_primary) {
      const contact = await prisma.organizationContact.findUnique({ where: { id: contactId } });
      if (contact) {
        await prisma.organizationContact.updateMany({
          where: { organization_id: contact.organization_id, is_primary: true },
          data: { is_primary: false }
        });
      }
    }

    const updated = await prisma.organizationContact.update({
      where: { id: contactId },
      data: validatedData
    });

    res.status(200).json({ success: true, message: 'Contact updated', data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteOrganizationContact = async (req, res) => {
  try {
    await prisma.organizationContact.delete({
      where: { id: req.params.contactId }
    });
    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationContacts,
  addOrganizationContact,
  updateOrganizationContact,
  deleteOrganizationContact
};
