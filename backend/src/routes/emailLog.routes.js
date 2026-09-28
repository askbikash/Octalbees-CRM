const express = require('express');
const { getEmailLogs, getLeadEmailLogs } = require('../controllers/emailLog.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getEmailLogs);
router.get('/lead/:leadId', getLeadEmailLogs);

module.exports = router;
