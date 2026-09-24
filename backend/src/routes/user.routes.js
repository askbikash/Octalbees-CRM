const express = require('express');
const { createUser, getUsers, updateUserStatus, updateProfile, updatePassword, getUserPerformance } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// Public (Authenticated) routes
router.get('/', getUsers); // Needed for assignment dropdown
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

// Admin only routes
router.post('/', requireAdmin, createUser);
router.patch('/:id/status', requireAdmin, updateUserStatus);
router.get('/:id/performance', requireAdmin, getUserPerformance);

module.exports = router;
