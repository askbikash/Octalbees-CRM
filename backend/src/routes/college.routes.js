const express = require('express');
const { createCollege, getColleges, getCollegeById, updateCollege, deleteCollege } = require('../controllers/college.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate); // All college routes require authentication

router.post('/', createCollege);
router.get('/', getColleges);
router.get('/:id', getCollegeById);
router.put('/:id', updateCollege);
router.delete('/:id', deleteCollege);

module.exports = router;
