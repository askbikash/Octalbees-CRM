const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getEmailLogs = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    
    // Admins see all, BDEs see only their sent emails
    const where = role === 'ADMIN' ? {} : { sent_by: userId };

    const logs = await prisma.emailLog.findMany({
      where,
      orderBy: { sent_at: 'desc' },
      include: {
        lead: { select: { name: true, lead_code: true } },
        sender: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getLeadEmailLogs = async (req, res) => {
  try {
    const { leadId } = req.params;

    const logs = await prisma.emailLog.findMany({
      where: { lead_id: leadId },
      orderBy: { sent_at: 'desc' },
      include: {
        sender: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching lead email logs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getEmailLogs,
  getLeadEmailLogs
};
