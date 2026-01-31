import { Router } from 'express';
import { invoicePaymentController } from '../controllers/invoicePaymentController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', invoicePaymentController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, invoicePaymentController.getById);

router.post('/',
    [
        body('customerInvoiceId').isUUID(),
        body('amount').isNumeric().custom((value) => value > 0),
        body('paymentMethod').optional().isIn(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD'])
    ],
    validateRequest,
    invoicePaymentController.create
);

router.delete('/:id', param('id').isUUID(), validateRequest, invoicePaymentController.delete);

export default router;
