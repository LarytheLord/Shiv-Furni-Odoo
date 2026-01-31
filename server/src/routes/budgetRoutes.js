const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', budgetController.getBudgets);
router.get('/:id', budgetController.getBudget);
router.post('/', authorizeRoles('admin'), budgetController.createBudget);
router.put('/:id', authorizeRoles('admin'), budgetController.updateBudget);
router.delete('/:id', authorizeRoles('admin'), budgetController.deleteBudget);

module.exports = router;
