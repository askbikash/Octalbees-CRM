const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const collegeSchema = z.object({
  name: z.string().min(2),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(['COLLEGE', 'UNIVERSITY', 'INSTITUTE', 'TRAINING_INSTITUTE', 'OTHER']).optional(),
  notes: z.string().optional()
});

const createCollege = async (req, res) => {
  try {
    const validatedData = collegeSchema.parse(req.body);
    const college = await prisma.college.create({
      data: {
        ...validatedData,
        created_by: req.user.id
      }
    });
    res.status(201).json({ success: true, message: 'College created successfully', data: college });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getColleges = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive'
      }
    } : {};

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.college.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: colleges,
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

const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await prisma.college.findUnique({
      where: { id },
      include: { leads: true } // V1 includes leads linked to this college
    });

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    res.status(200).json({ success: true, data: college });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    const existingCollege = await prisma.college.findUnique({ where: { id } });
    if (!existingCollege) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    
    if (req.user.role !== 'ADMIN' && existingCollege.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only edit colleges you created.' });
    }

    const validatedData = collegeSchema.partial().parse(req.body);

    const college = await prisma.college.update({
      where: { id },
      data: validatedData
    });

    res.status(200).json({ success: true, message: 'College updated successfully', data: college });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if college has associated leads
    const college = await prisma.college.findUnique({
      where: { id },
      include: { _count: { select: { leads: true } } }
    });

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    if (req.user.role !== 'ADMIN' && college.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only delete colleges you created.' });
    }

    if (college._count.leads > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete college with active leads' });
    }

    await prisma.college.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'College deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege
};
