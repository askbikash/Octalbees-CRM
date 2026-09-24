const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // 'ADMIN' or 'BDE'

    // Build base query object for leads depending on role
    const leadWhere = role === 'ADMIN' ? {} : { assigned_to: userId };
    
    // Build base query for followups depending on role
    const followupWhere = role === 'ADMIN' ? {} : { assigned_to: userId };

    // 1. Core KPIs
    const totalLeads = await prisma.lead.count({ where: leadWhere });
    
    const convertedLeads = await prisma.lead.count({ 
      where: { ...leadWhere, status: 'CONVERTED' } 
    });

    const pendingFollowUps = await prisma.followUp.count({
      where: { ...followupWhere, status: 'PENDING' }
    });

    // Overdue followups (pending and scheduled in the past)
    const overdueFollowUps = await prisma.followUp.count({
      where: { 
        ...followupWhere, 
        status: 'PENDING',
        scheduled_at: { lt: new Date() }
      }
    });

    // New leads this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const newLeadsThisWeek = await prisma.lead.count({
      where: { ...leadWhere, created_at: { gte: startOfWeek } }
    });

    // 2. Chart Data: Leads by Status
    const statusGroups = await prisma.lead.groupBy({
      by: ['status'],
      where: leadWhere,
      _count: { status: true },
    });

    // 3. Chart Data: Leads by Source
    const sourceGroups = await prisma.lead.groupBy({
      by: ['source'],
      where: leadWhere,
      _count: { source: true },
    });

    // 4. Today's Follow-ups
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysFollowUps = await prisma.followUp.findMany({
      where: {
        ...followupWhere,
        status: 'PENDING',
        scheduled_at: { gte: todayStart, lte: todayEnd }
      },
      include: {
        lead: { select: { id: true, name: true, lead_code: true, phone: true, status: true } },
      },
      orderBy: { scheduled_at: 'asc' },
      take: 8
    });

    // 5. Recent Activity (last 10 activities)
    const recentActivityWhere = role === 'ADMIN' ? {} : { lead: { assigned_to: userId } };
    const recentActivities = await prisma.activity.findMany({
      where: recentActivityWhere,
      include: {
        lead: { select: { name: true, lead_code: true } },
        user: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalLeads,
          convertedLeads,
          pendingFollowUps,
          overdueFollowUps,
          newLeadsThisWeek,
        },
        charts: {
          statusData: statusGroups.map(g => ({ name: g.status, value: g._count.status })),
          sourceData: sourceGroups.map(g => ({ name: g.source, value: g._count.source }))
        },
        todaysFollowUps,
        recentActivities,
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats
};
