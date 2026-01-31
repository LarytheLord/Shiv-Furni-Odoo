import { Router } from 'express';
import { budgetController } from '../controllers/budgetController';
import { budgetRevisionController } from '../controllers/budgetRevisionController';
import { budgetAlertController } from '../controllers/budgetAlertController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

// Budget CRUD
router.get('/', budgetController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, budgetController.getById);
router.get('/:id/metrics', param('id').isUUID(), validateRequest, budgetController.getMetrics);
router.get('/:id/export-pdf', param('id').isUUID(), validateRequest, budgetController.exportPdf);

router.post('/',
    adminOnly,
    [
        body('name').notEmpty().trim(),
        body('dateFrom').isISO8601(),
        body('dateTo').isISO8601(),
        body('lines').isArray({ min: 1 })
    ],
    validateRequest,
    budgetController.create
);

router.patch('/:id', adminOnly, param('id').isUUID(), validateRequest, budgetController.update);
router.delete('/:id', adminOnly, param('id').isUUID(), validateRequest, budgetController.delete);

// Budget lines
router.post('/:id/lines', adminOnly, param('id').isUUID(), [body('analyticalAccountId').isUUID(), body('plannedAmount').isNumeric()], validateRequest, budgetController.addLine);
router.patch('/:id/lines/:lineId', adminOnly, [param('id').isUUID(), param('lineId').isUUID()], validateRequest, budgetController.updateLine);
router.delete('/:id/lines/:lineId', adminOnly, [param('id').isUUID(), param('lineId').isUUID()], validateRequest, budgetController.deleteLine);

// Budget actions
router.post('/:id/confirm', adminOnly, param('id').isUUID(), validateRequest, budgetController.confirm);
router.post('/:id/validate', adminOnly, param('id').isUUID(), validateRequest, budgetController.validate);
router.post('/:id/simulate', param('id').isUUID(), validateRequest, budgetController.simulate);

export default router;
