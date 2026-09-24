const express = require('express');
const { getActivities } = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// Only admins can view the global audit trail
router.get('/', requireAdmin, getActivities);

module.exports = router;
