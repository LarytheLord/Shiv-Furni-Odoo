import { Router } from 'express';
import { budgetRevisionController } from '../controllers/budgetRevisionController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/', budgetRevisionController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, budgetRevisionController.getById);
router.get('/history/:budgetLineId', param('budgetLineId').isUUID(), validateRequest, budgetRevisionController.getHistory);

router.post('/',
    [
        body('budgetLineId').isUUID(),
        body('newAmount').isNumeric(),
        body('reason').isIn(['MARKET_CHANGE', 'OPERATIONAL_NEED', 'COST_OPTIMIZATION', 'EMERGENCY', 'OTHER'])
    ],
    validateRequest,
    budgetRevisionController.create
);

router.post('/:id/submit', param('id').isUUID(), validateRequest, budgetRevisionController.submit);
router.post('/:id/approve', adminOnly, param('id').isUUID(), validateRequest, budgetRevisionController.approve);
router.post('/:id/reject', adminOnly, param('id').isUUID(), body('rejectionReason').optional(), validateRequest, budgetRevisionController.reject);
router.post('/:id/cancel', param('id').isUUID(), validateRequest, budgetRevisionController.cancel);

export default router;
