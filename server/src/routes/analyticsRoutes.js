const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/budget-vs-actuals', analyticsController.getBudgetVsActuals);

module.exports = router;
