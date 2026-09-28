const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

// 1x1 transparent GIF (Base64)
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const trackOpen = async (req, res) => {
  try {
    const { emailLogId } = req.params;

    if (emailLogId) {
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: 'OPENED',
          opened_at: new Date(),
          open_count: { increment: 1 }
        }
      });
    }

  } catch (error) {
    // Ignore errors for tracking pixel so the image still loads
    console.error('Error tracking email open:', error);
  } finally {
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_GIF_BUFFER.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(TRANSPARENT_GIF_BUFFER);
  }
};

const trackClick = async (req, res) => {
  try {
    const { emailLogId } = req.params;
    const { url } = req.query;

    if (!url) {
      return res.status(400).send('URL is required');
    }

    if (emailLogId) {
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: 'CLICKED',
          click_count: { increment: 1 }
        }
      });
    }

    // Redirect to original URL
    res.redirect(url);
  } catch (error) {
    console.error('Error tracking email click:', error);
    // Even if tracking fails, redirect the user to the destination
    if (req.query.url) {
      res.redirect(req.query.url);
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
};

module.exports = {
  trackOpen,
  trackClick
};
