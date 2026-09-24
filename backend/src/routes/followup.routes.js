const express = require('express');
const { createFollowUp, getFollowUps, updateFollowUp } = require('../controllers/followup.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All follow-up routes require authentication
router.use(authenticate);

router.post('/', createFollowUp);
router.get('/', getFollowUps);
router.patch('/:id', updateFollowUp);

module.exports = router;
