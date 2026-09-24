const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const fs = require('fs');
const { parse } = require('csv-parse');

const prisma = new PrismaClient();

const generateLeadCode = async () => {
  const lastLead = await prisma.lead.findFirst({
    orderBy: { created_at: 'desc' }
  });

  if (!lastLead) return 'OB-000001';

  const lastNumber = parseInt(lastLead.lead_code.replace('OB-', ''), 10);
  const nextNumber = lastNumber + 1;
  return `OB-${nextNumber.toString().padStart(6, '0')}`;
};

const leadSchema = z.object({
  name: z.string().min(2),
  lead_type: z.enum(['STUDENT', 'COLLEGE', 'TPO', 'COLLEGE_CONTACT', 'STUDENT_CLUB', 'TRAINING_PARTNER', 'OTHER']).default('STUDENT'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).optional().or(z.literal('')),
  alternate_phone: z.string().optional().or(z.literal('')),
  college_id: z.string().uuid().optional().or(z.literal('')),
  designation: z.string().optional(),
  city: z.string().optional(),
  source: z.enum(['WEBSITE', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP', 'COLLEGE_OUTREACH', 'STUDENT_COMMUNITY', 'REFERRAL', 'GOOGLE', 'ADVERTISEMENT', 'EVENT', 'OTHER']).default('OTHER'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'HOT']).default('MEDIUM'),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().optional(),
  force: z.boolean().optional().default(false)
});

const createLead = async (req, res) => {
  try {
    const validatedData = leadSchema.parse(req.body);
    const { force, ...leadData } = validatedData;
    
    // Convert empty strings to null for optional relations
    if (leadData.college_id === '') leadData.college_id = null;
    if (leadData.email === '') leadData.email = null;
    if (leadData.phone === '') leadData.phone = null;
    if (leadData.alternate_phone === '') leadData.alternate_phone = null;

    // Duplicate detection unless forced
    if (!force) {
      const orConditions = [];
      if (leadData.phone) orConditions.push({ phone: leadData.phone });
      if (leadData.email) orConditions.push({ email: leadData.email });
      if (leadData.name && leadData.college_id) {
        orConditions.push({
          name: leadData.name,
          college_id: leadData.college_id
        });
      }

      if (orConditions.length > 0) {
        const potentialDuplicates = await prisma.lead.findMany({
          where: { OR: orConditions },
          include: { assigned_user: { select: { name: true } }, college: { select: { name: true } } }
        });

        if (potentialDuplicates.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Potential duplicate found',
            isDuplicateWarning: true,
            duplicates: potentialDuplicates
          });
        }
      }
    }

    const lead_code = await generateLeadCode();
    
    const lead = await prisma.lead.create({
      data: {
        ...leadData,
        lead_code,
        created_by: req.user.id
      }
    });

    // Create Initial Activity
    await prisma.activity.create({
      data: {
        lead_id: lead.id,
        user_id: req.user.id,
        type: 'NOTE',
        description: `Lead created from source: ${leadData.source}`
      }
    });

    res.status(201).json({ success: true, message: 'Lead created successfully', data: lead });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status, assigned_to } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = {};
    if (status) where.status = status;
    if (assigned_to) where.assigned_to = assigned_to;
    
    // BDEs can only see their own leads unless they are ADMIN
    if (req.user.role !== 'ADMIN') {
      where.assigned_to = req.user.id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { lead_code: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          assigned_user: { select: { name: true } },
          college: { select: { name: true } }
        }
      }),
      prisma.lead.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: leads,
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

const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        college: true,
        assigned_user: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        activities: { 
          orderBy: { created_at: 'desc' },
          include: { user: { select: { name: true } } }
        },
        follow_ups: { 
          orderBy: { scheduled_at: 'desc' },
          include: { assigned_user: { select: { name: true } } }
        },
        status_history: {
          orderBy: { created_at: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Access control check
    if (req.user.role !== 'ADMIN' && lead.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this lead' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'MEETING_SCHEDULED', 'NEGOTIATION', 'CONVERTED', 'NOT_INTERESTED', 'LOST']),
  reason: z.string().optional()
});

const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = updateStatusSchema.parse(req.body);

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (lead.status === status) {
      return res.status(400).json({ success: false, message: 'Lead is already in this status' });
    }

    const updatedLead = await prisma.$transaction(async (tx) => {
      const updated = await tx.lead.update({
        where: { id },
        data: {
          status,
          converted_at: status === 'CONVERTED' ? new Date() : null,
          lost_reason: status === 'LOST' ? reason : null
        }
      });

      await tx.leadStatusHistory.create({
        data: {
          lead_id: id,
          old_status: lead.status,
          new_status: status,
          reason: reason,
          changed_by: req.user.id
        }
      });

      await tx.activity.create({
        data: {
          lead_id: id,
          user_id: req.user.id,
          type: 'STATUS_CHANGE',
          description: `Changed status from ${lead.status.replace('_', ' ')} to ${status.replace('_', ' ')}`
        }
      });

      return updated;
    });

    res.status(200).json({ success: true, data: updatedLead, message: 'Status updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = leadSchema.partial().parse(req.body);
    
    // Clean up empty strings
    if (validatedData.college_id === '') validatedData.college_id = null;
    if (validatedData.email === '') validatedData.email = null;
    if (validatedData.phone === '') validatedData.phone = null;
    if (validatedData.alternate_phone === '') validatedData.alternate_phone = null;
    delete validatedData.force; // Don't let force be updated

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Access check for non-admins
    if (req.user.role !== 'ADMIN' && lead.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: validatedData
    });

    res.status(200).json({ success: true, data: updated, message: 'Lead updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Only ADMIN can delete leads
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only administrators can delete leads. Change status to LOST instead.' });
    }

    await prisma.lead.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const importLeads = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only administrators can import leads.' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No CSV file provided' });
  }

  const results = [];
  const errors = [];
  let rowCount = 0;

  try {
    const parser = fs.createReadStream(req.file.path).pipe(
      parse({
        columns: true, // Treat first row as headers
        skip_empty_lines: true,
        trim: true
      })
    );

    for await (const row of parser) {
      rowCount++;
      try {
        // Validate required fields from CSV
        if (!row.name || (!row.email && !row.phone)) {
          errors.push({ row: rowCount, message: 'Name and either email or phone are required.' });
          continue;
        }

        // Basic deduplication check per row before inserting
        const duplicateConds = [];
        if (row.email) duplicateConds.push({ email: row.email });
        if (row.phone) duplicateConds.push({ phone: row.phone });

        if (duplicateConds.length > 0) {
          const existingLead = await prisma.lead.findFirst({
            where: { OR: duplicateConds }
          });
          
          if (existingLead) {
            errors.push({ row: rowCount, message: `Duplicate found with email/phone. Lead Code: ${existingLead.lead_code}` });
            continue;
          }
        }

        const leadCode = await generateLeadCode();

        const leadData = {
          lead_code: leadCode,
          name: row.name,
          email: row.email || null,
          phone: row.phone || null,
          alternate_phone: row.alternate_phone || null,
          designation: row.designation || null,
          source: row.source || 'OTHER',
          lead_type: row.lead_type || 'STUDENT',
          priority: row.priority || 'MEDIUM',
          assigned_to: req.user.id // Assign to the user importing by default
        };

        const newLead = await prisma.lead.create({
          data: leadData
        });

        await prisma.activity.create({
          data: {
            lead_id: newLead.id,
            user_id: req.user.id,
            type: 'NOTE',
            description: 'Lead created via CSV Import'
          }
        });

        results.push(newLead);
      } catch (rowError) {
        errors.push({ row: rowCount, message: rowError.message });
      }
    }

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: `Import completed. Inserted: ${results.length}, Errors: ${errors.length}`,
      data: {
        insertedCount: results.length,
        errors
      }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('CSV Import Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process CSV file.' });
  }
};

const exportLeads = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only administrators can export leads.' });
    }
    const where = {};

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        assigned_user: { select: { name: true } },
        college: { select: { name: true } }
      }
    });

    // Generate CSV String
    let csv = 'Lead Code,Name,Email,Phone,Designation,Status,Source,Type,Priority,Assigned To,College,Created At\n';
    
    leads.forEach(lead => {
      const row = [
        `"${lead.lead_code}"`,
        `"${lead.name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.designation || ''}"`,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${lead.lead_type}"`,
        `"${lead.priority}"`,
        `"${lead.assigned_user?.name || 'Unassigned'}"`,
        `"${lead.college?.name || 'None'}"`,
        `"${new Date(lead.created_at).toISOString()}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ success: false, message: 'Failed to export leads' });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
  deleteLead,
  importLeads,
  exportLeads
};
