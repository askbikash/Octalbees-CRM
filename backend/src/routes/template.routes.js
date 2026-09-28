const express = require('express');
const { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, sendEmail } = require('../controllers/template.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getTemplates);
router.post('/send', sendEmail);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

module.exports = router;
