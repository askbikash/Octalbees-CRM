const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'BDE']).default('BDE'),
  phone: z.string().optional(),
  security_question: z.string().optional(),
  security_answer: z.string().optional()
});

const createUser = async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password_hash,
        role: validatedData.role,
        phone: validatedData.phone,
        security_question: validatedData.security_question || null,
        security_answer: validatedData.security_answer || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true
      }
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        is_active: true,
        created_at: true
      }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active must be a boolean' });
    }

    // Prevent deactivating oneself
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { is_active },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true
      }
    });

    res.status(200).json({ success: true, message: 'User status updated', data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, security_question, security_answer } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const updateData = { name, phone: phone || null };
    if (security_question !== undefined) updateData.security_question = security_question;
    if (security_answer !== undefined) updateData.security_answer = security_answer;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true, is_active: true, security_question: true }
    });

    res.status(200).json({ success: true, message: 'Profile updated', data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid current and new passwords are required (min 6 chars)' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash }
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [assigned, converted, followups] = await Promise.all([
      prisma.lead.count({ where: { assigned_to: id } }),
      prisma.lead.count({ where: { assigned_to: id, status: 'CONVERTED' } }),
      prisma.followUp.count({ where: { lead: { assigned_to: id }, status: 'COMPLETED' } })
    ]);

    res.status(200).json({
      success: true,
      data: { assigned, converted, followups }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUserStatus,
  updateProfile,
  updatePassword,
  getUserPerformance
};
