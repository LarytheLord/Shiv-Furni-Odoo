import { Router } from 'express';
import { budgetAlertController } from '../controllers/budgetAlertController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/', budgetAlertController.getAll);
router.get('/active', budgetAlertController.getActive);
router.get('/stats', budgetAlertController.getStats);

router.post('/:id/acknowledge', param('id').isUUID(), body('actionTaken').optional(), validateRequest, budgetAlertController.acknowledge);
router.post('/bulk-acknowledge', body('alertIds').isArray(), validateRequest, budgetAlertController.bulkAcknowledge);

router.post('/process', adminOnly, budgetAlertController.processAlerts);
router.post('/check-underutilization', adminOnly, body('threshold').optional().isNumeric(), validateRequest, budgetAlertController.checkUnderutilization);

export default router;
