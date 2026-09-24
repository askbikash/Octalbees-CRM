const prisma = require('../config/prisma');
const { z } = require('zod');

const createFollowUpSchema = z.object({
  lead_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  scheduled_at: z.string().datetime(),
  type: z.enum(['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'OTHER']),
  notes: z.string().optional()
});

// Create a new follow-up
const createFollowUp = async (req, res) => {
  try {
    const validatedData = createFollowUpSchema.parse(req.body);
    
    // Default assignment to self if not provided
    const assignedTo = validatedData.assigned_to || req.user.id;

    // Verify lead exists
    const lead = await prisma.lead.findUnique({ where: { id: validatedData.lead_id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const followUp = await prisma.$transaction(async (tx) => {
      // Auto-cancel existing pending follow-ups for this lead to avoid clutter
      await tx.followUp.updateMany({
        where: { lead_id: validatedData.lead_id, status: 'PENDING' },
        data: { status: 'CANCELLED' }
      });

      // Create the follow-up
      const newFollowUp = await tx.followUp.create({
        data: {
          lead_id: validatedData.lead_id,
          assigned_to: assignedTo,
          scheduled_at: validatedData.scheduled_at,
          type: validatedData.type,
          notes: validatedData.notes,
          created_by: req.user.id
        }
      });

      // Update Lead's next_follow_up_at if this one is sooner or none exists
      if (!lead.next_follow_up_at || new Date(validatedData.scheduled_at) < lead.next_follow_up_at) {
        await tx.lead.update({
          where: { id: validatedData.lead_id },
          data: { next_follow_up_at: validatedData.scheduled_at }
        });
      }

      // Log activity
      await tx.activity.create({
        data: {
          lead_id: validatedData.lead_id,
          user_id: req.user.id,
          type: 'FOLLOW_UP_CREATED',
          description: `Scheduled a ${validatedData.type} follow-up for ${new Date(validatedData.scheduled_at).toLocaleString()}`
        }
      });

      return newFollowUp;
    });

    res.status(201).json({ success: true, data: followUp, message: 'Follow-up scheduled successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error('Create FollowUp Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get follow-ups (with filtering)
const getFollowUps = async (req, res) => {
  try {
    const { status, timeframe, lead_id } = req.query;
    
    let where = {};
    
    // BDEs can only see their own assigned follow-ups, Admins can see all
    if (req.user.role !== 'ADMIN') {
      where.assigned_to = req.user.id;
    }

    if (status) {
      where.status = status;
    }
    
    if (lead_id) {
      where.lead_id = lead_id;
    }

    // Timeframe filters
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    if (timeframe === 'today') {
      where.scheduled_at = { gte: todayStart, lte: todayEnd };
    } else if (timeframe === 'upcoming') {
      where.scheduled_at = { gt: todayEnd };
    } else if (timeframe === 'overdue') {
      where.scheduled_at = { lt: todayStart };
      where.status = 'PENDING';
    }

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        lead: {
          select: { name: true, lead_code: true, phone: true, email: true, college: { select: { name: true } } }
        },
        assigned_user: {
          select: { name: true }
        }
      },
      orderBy: { scheduled_at: 'asc' }
    });

    res.status(200).json({ success: true, data: followUps });
  } catch (error) {
    console.error('Get FollowUps Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateFollowUpSchema = z.object({
  status: z.enum(['COMPLETED', 'MISSED', 'CANCELLED']),
  notes: z.string().optional()
});

// Complete or update a follow-up
const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateFollowUpSchema.parse(req.body);

    const existingFollowUp = await prisma.followUp.findUnique({ where: { id } });
    if (!existingFollowUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    // Prevent BDEs from modifying other peoples follow-ups
    if (req.user.role !== 'ADMIN' && existingFollowUp.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this follow-up' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.followUp.update({
        where: { id },
        data: {
          status: validatedData.status,
          notes: validatedData.notes || existingFollowUp.notes,
          completed_at: validatedData.status === 'COMPLETED' ? new Date() : null
        }
      });

      // Recalculate lead's next_follow_up_at by finding their next pending follow-up
      const nextPending = await tx.followUp.findFirst({
        where: { lead_id: existingFollowUp.lead_id, status: 'PENDING', id: { not: id } },
        orderBy: { scheduled_at: 'asc' }
      });

      await tx.lead.update({
        where: { id: existingFollowUp.lead_id },
        data: {
          next_follow_up_at: nextPending ? nextPending.scheduled_at : null,
          last_contacted_at: validatedData.status === 'COMPLETED' ? new Date() : undefined
        }
      });

      // Log activity
      if (validatedData.status === 'COMPLETED') {
        await tx.activity.create({
          data: {
            lead_id: existingFollowUp.lead_id,
            user_id: req.user.id,
            type: 'FOLLOW_UP_COMPLETED',
            description: `Completed ${existingFollowUp.type} follow-up. Notes: ${validatedData.notes || 'None'}`
          }
        });
      }

      return updated;
    });

    res.status(200).json({ success: true, data: result, message: `Follow-up marked as ${validatedData.status}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error('Update FollowUp Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  updateFollowUp
};
