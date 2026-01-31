import { Router } from 'express';
import { productController } from '../controllers/productController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id', param('id').isUUID(), validateRequest, productController.getById);

router.post('/',
    adminOnly,
    [
        body('name').notEmpty().trim(),
        body('categoryId').isUUID(),
        body('costPrice').optional().isNumeric(),
        body('salePrice').optional().isNumeric(),
        body('taxRate').optional().isNumeric()
    ],
    validateRequest,
    productController.create
);

router.patch('/:id',
    adminOnly,
    param('id').isUUID(),
    validateRequest,
    productController.update
);

router.delete('/:id', adminOnly, param('id').isUUID(), validateRequest, productController.delete);

// Category routes
router.post('/categories',
    adminOnly,
    body('name').notEmpty().trim(),
    validateRequest,
    productController.createCategory
);

router.patch('/categories/:id',
    adminOnly,
    param('id').isUUID(),
    validateRequest,
    productController.updateCategory
);

router.delete('/categories/:id', adminOnly, param('id').isUUID(), validateRequest, productController.deleteCategory);

export default router;
