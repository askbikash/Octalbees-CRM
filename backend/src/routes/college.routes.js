const express = require('express');
const { 
  createCollege, getColleges, getCollegeById, updateCollege, deleteCollege,
  getCollegeContacts, addCollegeContact, updateCollegeContact, deleteCollegeContact
} = require('../controllers/college.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate); // All college routes require authentication

// College Core Routes
router.post('/', createCollege);
router.get('/', getColleges);
router.get('/:id', getCollegeById);
router.put('/:id', updateCollege);
router.delete('/:id', deleteCollege);

// College Contacts Routes
router.get('/:id/contacts', getCollegeContacts);
router.post('/:id/contacts', addCollegeContact);
router.put('/contacts/:contactId', updateCollegeContact);
router.delete('/contacts/:contactId', deleteCollegeContact);

module.exports = router;
