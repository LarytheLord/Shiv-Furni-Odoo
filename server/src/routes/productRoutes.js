const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
// Only Admin can manage products
router.post('/', authorizeRoles('admin'), productController.createProduct);
router.put('/:id', authorizeRoles('admin'), productController.updateProduct);
router.delete('/:id', authorizeRoles('admin'), productController.deleteProduct);

module.exports = router;
