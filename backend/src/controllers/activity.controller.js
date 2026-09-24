const prisma = require('../config/prisma');

const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (user_id) where.user_id = user_id;
    if (type) where.type = type;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true } },
          lead: { select: { id: true, name: true, lead_code: true } }
        }
      }),
      prisma.activity.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Activities Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getActivities
};
