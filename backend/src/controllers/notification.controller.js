const prisma = require('../config/prisma');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 50 // Limit to recent 50
    });

    const unreadCount = await prisma.notification.count({
      where: { user_id: req.user.id, is_read: false }
    });

    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it belongs to user
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { is_read: true }
    });

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data: { is_read: true }
    });
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
