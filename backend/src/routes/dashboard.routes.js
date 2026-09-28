const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { getReports } = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/reports', getReports);

module.exports = router;
