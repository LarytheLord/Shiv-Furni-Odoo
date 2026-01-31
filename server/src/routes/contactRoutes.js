const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken); // Protect all routes

router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContact);
router.post('/', authorizeRoles('admin'), contactController.createContact);
router.put('/:id', authorizeRoles('admin'), contactController.updateContact);
router.delete('/:id', authorizeRoles('admin'), contactController.deleteContact);

module.exports = router;
