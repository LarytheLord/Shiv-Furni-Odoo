import { Router } from 'express';
import { portalController } from '../controllers/portalController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All portal routes require authentication
router.use(authMiddleware);

router.get('/stats', portalController.getStats);

// Note: Customer/Vendor specific list/detail routes are handled 
// by existing controllers (SalesOrder, etc.) with role checks.

export default router;
