import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getRecentActivity);

export default router;
