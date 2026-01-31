import { Router } from 'express';
import { billPaymentController } from '../controllers/billPaymentController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', billPaymentController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, billPaymentController.getById);

router.post('/',
    [
        body('vendorBillId').isUUID(),
        body('amount').isNumeric().custom((value) => value > 0),
        body('paymentMethod').optional().isIn(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD'])
    ],
    validateRequest,
    billPaymentController.create
);

router.delete('/:id', param('id').isUUID(), validateRequest, billPaymentController.delete);

export default router;
