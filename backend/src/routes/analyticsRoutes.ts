import { Router } from 'express';
import { getBudgetVsActuals, getStats } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

// GET /api/analytics/budget-vs-actuals - Get budget vs actuals analysis
router.get('/budget-vs-actuals', getBudgetVsActuals);

// GET /api/analytics/stats - Get summary statistics
router.get('/stats', getStats);

export default router;
