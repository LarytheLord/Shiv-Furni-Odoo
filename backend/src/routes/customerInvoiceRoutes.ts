import { Router } from 'express';
import { customerInvoiceController } from '../controllers/customerInvoiceController';
import { invoicePaymentController } from '../controllers/invoicePaymentController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly, portalAccess } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

// Portal users can view their invoices
router.get('/my-invoices', portalAccess, customerInvoiceController.getMyInvoices);

// Admin routes
router.get('/', adminOnly, customerInvoiceController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, customerInvoiceController.getById);
router.get('/:id/pdf', param('id').isUUID(), validateRequest, customerInvoiceController.generatePdf);
router.get('/:invoiceId/payments', param('invoiceId').isUUID(), validateRequest, adminOnly, invoicePaymentController.getByInvoice);

router.post('/',
    adminOnly,
    [
        body('customerId').isUUID(),
        body('dueDate').isISO8601(),
        body('lines').isArray({ min: 1 })
    ],
    validateRequest,
    customerInvoiceController.create
);

router.patch('/:id', adminOnly, param('id').isUUID(), validateRequest, customerInvoiceController.update);
router.delete('/:id', adminOnly, param('id').isUUID(), validateRequest, customerInvoiceController.delete);
router.post('/:id/confirm', adminOnly, param('id').isUUID(), validateRequest, customerInvoiceController.confirm);

export default router;
