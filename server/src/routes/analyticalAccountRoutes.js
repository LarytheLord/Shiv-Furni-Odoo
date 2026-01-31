const express = require('express');
const router = express.Router();
const analyticalAccountController = require('../controllers/analyticalAccountController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', analyticalAccountController.getAccounts);
router.get('/:id', analyticalAccountController.getAccount);
router.post('/', authorizeRoles('admin'), analyticalAccountController.createAccount);
router.put('/:id', authorizeRoles('admin'), analyticalAccountController.updateAccount);
router.delete('/:id', authorizeRoles('admin'), analyticalAccountController.deleteAccount);

module.exports = router;
