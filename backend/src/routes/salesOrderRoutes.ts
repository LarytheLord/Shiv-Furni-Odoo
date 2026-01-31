import { Router } from 'express';
import { salesOrderController } from '../controllers/salesOrderController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', salesOrderController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, salesOrderController.getById);

router.post('/',
    [
        body('customerId').isUUID(),
        body('lines').isArray({ min: 1 })
    ],
    validateRequest,
    salesOrderController.create
);

router.patch('/:id', param('id').isUUID(), validateRequest, salesOrderController.update);
router.delete('/:id', param('id').isUUID(), validateRequest, salesOrderController.delete);

router.post('/:id/confirm', param('id').isUUID(), validateRequest, salesOrderController.confirm);
router.post('/:id/create-invoice', param('id').isUUID(), body('dueDate').isISO8601(), validateRequest, salesOrderController.createInvoice);

export default router;
