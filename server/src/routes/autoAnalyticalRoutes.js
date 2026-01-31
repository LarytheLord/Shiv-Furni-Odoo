const express = require('express');
const router = express.Router();
const autoAnalyticalController = require('../controllers/autoAnalyticalController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// All management only for admin
router.get('/', authorizeRoles('admin'), autoAnalyticalController.getRules);
router.get('/:id', authorizeRoles('admin'), autoAnalyticalController.getRule);
router.post('/', authorizeRoles('admin'), autoAnalyticalController.createRule);
router.put('/:id', authorizeRoles('admin'), autoAnalyticalController.updateRule);
router.delete('/:id', authorizeRoles('admin'), autoAnalyticalController.deleteRule);

module.exports = router;
