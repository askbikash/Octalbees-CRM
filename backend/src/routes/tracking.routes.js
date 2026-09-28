const express = require('express');
const { trackOpen, trackClick } = require('../controllers/tracking.controller');

const router = express.Router();

// Public routes for email tracking (no auth required because they are embedded in emails)
router.get('/open/:emailLogId', trackOpen);
router.get('/click/:emailLogId', trackClick);

module.exports = router;
