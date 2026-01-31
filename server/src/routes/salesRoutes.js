const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// Sales Orders
router.get('/orders', salesController.getSalesOrders);
router.get('/orders/:id', salesController.getSalesOrder);
router.post('/orders', authorizeRoles('admin'), salesController.createSalesOrder);
router.post('/orders/:id/confirm', authorizeRoles('admin'), salesController.confirmSalesOrder);

// Invoices
router.get('/invoices', salesController.getInvoices);
router.get('/invoices/:id', salesController.getInvoice);
router.post('/invoices/from-so', authorizeRoles('admin'), salesController.createInvoiceFromSO);
router.post('/invoices/:id/post', authorizeRoles('admin'), salesController.postInvoice);

module.exports = router;
