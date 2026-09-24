const express = require('express');
const multer = require('multer');
const { createLead, getLeads, getLeadById, updateLeadStatus, updateLead, deleteLead, importLeads, exportLeads } = require('../controllers/lead.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max file size to prevent DoS
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  }
});

router.use(authenticate);

router.post('/', createLead);
router.post('/import', upload.single('file'), importLeads);
router.get('/export', exportLeads);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.patch('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

module.exports = router;
