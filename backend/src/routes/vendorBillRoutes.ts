import { Router } from 'express';
import { vendorBillController } from '../controllers/vendorBillController';
import { billPaymentController } from '../controllers/billPaymentController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', vendorBillController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, vendorBillController.getById);
router.get('/:id/pdf', param('id').isUUID(), validateRequest, vendorBillController.generatePdf);
router.get('/:id/conflicts', param('id').isUUID(), validateRequest, vendorBillController.getConflicts);
router.get('/:billId/payments', param('billId').isUUID(), validateRequest, billPaymentController.getByBill);

router.post('/',
    [
        body('vendorId').isUUID(),
        body('dueDate').isISO8601(),
        body('lines').isArray({ min: 1 })
    ],
    validateRequest,
    vendorBillController.create
);

router.patch('/:id', param('id').isUUID(), validateRequest, vendorBillController.update);
router.delete('/:id', param('id').isUUID(), validateRequest, vendorBillController.delete);
router.post('/:id/confirm', param('id').isUUID(), validateRequest, vendorBillController.confirm);

export default router;
