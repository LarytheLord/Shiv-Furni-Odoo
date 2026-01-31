import { Router } from 'express';
import { purchaseOrderController } from '../controllers/purchaseOrderController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', purchaseOrderController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, purchaseOrderController.getById);

router.post('/',
    [
        body('vendorId').isUUID(),
        body('lines').isArray({ min: 1 })
    ],
    validateRequest,
    purchaseOrderController.create
);

router.patch('/:id', param('id').isUUID(), validateRequest, purchaseOrderController.update);
router.delete('/:id', param('id').isUUID(), validateRequest, purchaseOrderController.delete);

router.post('/:id/confirm', param('id').isUUID(), validateRequest, purchaseOrderController.confirm);
router.post('/:id/create-bill', param('id').isUUID(), body('dueDate').isISO8601(), validateRequest, purchaseOrderController.createBill);

export default router;
