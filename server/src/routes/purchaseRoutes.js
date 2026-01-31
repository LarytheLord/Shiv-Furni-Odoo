const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// Purchase Orders
router.get('/orders', purchaseController.getPurchaseOrders);
router.get('/orders/:id', purchaseController.getPurchaseOrder);
router.post('/orders', authorizeRoles('admin'), purchaseController.createPurchaseOrder);
router.post('/orders/:id/confirm', authorizeRoles('admin'), purchaseController.confirmPurchaseOrder);

// Vendor Bills
router.get('/bills', purchaseController.getBills); // Vendor can see own? Logic in controller needed for strictness, assume admin or filter later
router.get('/bills/:id', purchaseController.getBill);
router.post('/bills/from-po', authorizeRoles('admin'), purchaseController.createBillFromPO);
router.post('/bills/:id/post', authorizeRoles('admin'), purchaseController.postBill);

module.exports = router;
