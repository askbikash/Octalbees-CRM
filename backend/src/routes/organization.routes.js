const express = require('express');
const { 
  createOrganization, getOrganizations, getOrganizationById, updateOrganization, deleteOrganization,
  getOrganizationContacts, addOrganizationContact, updateOrganizationContact, deleteOrganizationContact
} = require('../controllers/organization.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate); // All organization routes require authentication

// Organization Core Routes
router.post('/', createOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

// Organization Contacts Routes
router.get('/:id/contacts', getOrganizationContacts);
router.post('/:id/contacts', addOrganizationContact);
router.put('/contacts/:contactId', updateOrganizationContact);
router.delete('/contacts/:contactId', deleteOrganizationContact);

module.exports = router;
