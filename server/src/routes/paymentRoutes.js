const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', paymentController.getPayments);
router.post('/', authorizeRoles('admin', 'customer'), paymentController.createPayment); // Customers can pay too

module.exports = router;
