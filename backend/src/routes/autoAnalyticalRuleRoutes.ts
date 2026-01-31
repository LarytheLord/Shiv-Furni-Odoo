import { Router } from 'express';
import { autoAnalyticalRuleController } from '../controllers/autoAnalyticalRuleController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', autoAnalyticalRuleController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, autoAnalyticalRuleController.getById);

router.post('/',
    [
        body('name').notEmpty().trim(),
        body('analyticalAccountId').isUUID()
    ],
    validateRequest,
    autoAnalyticalRuleController.create
);

router.patch('/:id', param('id').isUUID(), validateRequest, autoAnalyticalRuleController.update);
router.delete('/:id', param('id').isUUID(), validateRequest, autoAnalyticalRuleController.delete);

router.post('/:id/test', param('id').isUUID(), validateRequest, autoAnalyticalRuleController.testRule);
router.post('/match', autoAnalyticalRuleController.findMatch);
router.post('/reorder', body('orderedIds').isArray(), validateRequest, autoAnalyticalRuleController.reorder);

export default router;
