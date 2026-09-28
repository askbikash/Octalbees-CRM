const prisma = require('../config/prisma');

// GET /api/dashboard/reports
const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { from, to } = req.query;

    const leadWhere = role === 'ADMIN' ? {} : { assigned_to: userId };
    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }
    if (Object.keys(dateFilter).length > 0) {
      leadWhere.created_at = dateFilter;
    }

    // 1. Conversion Funnel — count leads per status
    const funnelStatuses = ['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'MEETING_SCHEDULED', 'NEGOTIATION', 'CONVERTED'];
    const funnelWhere = { ...leadWhere };
    delete funnelWhere.created_at; // Funnel should show all-time pipeline
    const funnelData = await Promise.all(
      funnelStatuses.map(async (status) => {
        const count = await prisma.lead.count({ where: { ...funnelWhere, status } });
        return { status, count };
      })
    );

    // 2. BDE Performance Leaderboard
    const allUsers = await prisma.user.findMany({
      where: { role: 'BDE', is_active: true },
      select: { id: true, name: true }
    });

    const bdePerformance = await Promise.all(
      allUsers.map(async (u) => {
        const bdeWhere = { assigned_to: u.id };
        if (Object.keys(dateFilter).length > 0) {
          bdeWhere.created_at = dateFilter;
        }
        const total = await prisma.lead.count({ where: bdeWhere });
        const converted = await prisma.lead.count({ where: { ...bdeWhere, status: 'CONVERTED' } });
        const followUpsDone = await prisma.followUp.count({
          where: { assigned_to: u.id, status: 'COMPLETED' }
        });
        return {
          id: u.id,
          name: u.name,
          totalLeads: total,
          convertedLeads: converted,
          conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
          followUpsDone
        };
      })
    );
    bdePerformance.sort((a, b) => b.convertedLeads - a.convertedLeads);

    // 3. Source Effectiveness
    const allSources = await prisma.lead.groupBy({
      by: ['source'],
      where: leadWhere,
      _count: { source: true }
    });
    const sourceEffectiveness = await Promise.all(
      allSources.map(async (s) => {
        const converted = await prisma.lead.count({
          where: { ...leadWhere, source: s.source, status: 'CONVERTED' }
        });
        return {
          source: s.source,
          total: s._count.source,
          converted,
          conversionRate: s._count.source > 0 ? Math.round((converted / s._count.source) * 100) : 0
        };
      })
    );

    // 4. Weekly Trends (last 12 weeks)
    const weeklyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const baseWhere = role === 'ADMIN' ? {} : { assigned_to: userId };
      const count = await prisma.lead.count({
        where: { ...baseWhere, created_at: { gte: weekStart, lte: weekEnd } }
      });
      const converted = await prisma.lead.count({
        where: { ...baseWhere, created_at: { gte: weekStart, lte: weekEnd }, status: 'CONVERTED' }
      });

      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeklyTrends.push({ week: label, leads: count, converted });
    }

    // 5. Organization-wise Stats (top 15)
    const organizationStats = await prisma.lead.groupBy({
      by: ['organization_id'],
      where: { ...leadWhere, organization_id: { not: null } },
      _count: { organization_id: true }
    });
    const organizationIds = organizationStats.map(c => c.organization_id);
    const organizations = await prisma.organization.findMany({
      where: { id: { in: organizationIds } },
      select: { id: true, name: true, city: true }
    });
    const organizationMap = Object.fromEntries(organizations.map(c => [c.id, c]));

    const organizationData = await Promise.all(
      organizationStats.map(async (cs) => {
        const converted = await prisma.lead.count({
          where: { ...leadWhere, organization_id: cs.organization_id, status: 'CONVERTED' }
        });
        const organization = organizationMap[cs.organization_id];
        return {
          organizationName: organization?.name || 'Unknown',
          city: organization?.city || '',
          totalLeads: cs._count.organization_id,
          converted,
          conversionRate: cs._count.organization_id > 0 ? Math.round((converted / cs._count.organization_id) * 100) : 0
        };
      })
    );
    organizationData.sort((a, b) => b.totalLeads - a.totalLeads);

    // 6. Monthly Trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const baseWhere = role === 'ADMIN' ? {} : { assigned_to: userId };
      const count = await prisma.lead.count({
        where: { ...baseWhere, created_at: { gte: monthStart, lte: monthEnd } }
      });
      const converted = await prisma.lead.count({
        where: { ...baseWhere, created_at: { gte: monthStart, lte: monthEnd }, status: 'CONVERTED' }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyTrends.push({ month: monthNames[monthStart.getMonth()], leads: count, converted });
    }

    // 7. Summary KPIs
    const allTimeWhere = role === 'ADMIN' ? {} : { assigned_to: userId };
    const totalLeads = await prisma.lead.count({ where: allTimeWhere });
    const totalConverted = await prisma.lead.count({ where: { ...allTimeWhere, status: 'CONVERTED' } });
    const totalLost = await prisma.lead.count({ where: { ...allTimeWhere, status: { in: ['LOST', 'NOT_INTERESTED'] } } });
    const avgConversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: { totalLeads, totalConverted, totalLost, avgConversionRate },
        funnelData,
        bdePerformance,
        sourceEffectiveness,
        weeklyTrends,
        monthlyTrends,
        organizationData: organizationData.slice(0, 15)
      }
    });
  } catch (error) {
    console.error('Reports Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/followups/calendar
const getFollowUpCalendar = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { month, year } = req.query;
    
    const m = parseInt(month) - 1; // JS months are 0-indexed
    const y = parseInt(year);
    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const where = {
      scheduled_at: { gte: startDate, lte: endDate },
      ...(role !== 'ADMIN' ? { assigned_to: userId } : {})
    };

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, lead_code: true, phone: true } },
        assigned_user: { select: { name: true } }
      },
      orderBy: { scheduled_at: 'asc' }
    });

    // Group by date
    const grouped = {};
    followUps.forEach(fu => {
      const dateKey = fu.scheduled_at.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(fu);
    });

    res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    console.error('Calendar Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getReports, getFollowUpCalendar };
