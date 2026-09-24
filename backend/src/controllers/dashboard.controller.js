const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // 'ADMIN' or 'BDE'

    // Build base query object for leads depending on role
    const leadWhere = role === 'ADMIN' ? {} : { assigned_to: userId };
    
    // Build base query for followups depending on role
    const followupWhere = role === 'ADMIN' ? {} : { lead: { assigned_to: userId } };

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

    // 2. Chart Data: Leads by Status
    // Prisma grouping
    const statusGroups = await prisma.lead.groupBy({
      by: ['status'],
      where: leadWhere,
      _count: {
        status: true,
      },
    });

    // 3. Chart Data: Leads by Source
    const sourceGroups = await prisma.lead.groupBy({
      by: ['source'],
      where: leadWhere,
      _count: {
        source: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalLeads,
          convertedLeads,
          pendingFollowUps,
          overdueFollowUps,
        },
        charts: {
          statusData: statusGroups.map(g => ({ name: g.status, value: g._count.status })),
          sourceData: sourceGroups.map(g => ({ name: g.source, value: g._count.source }))
        }
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
