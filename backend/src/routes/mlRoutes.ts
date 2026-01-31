import { Router } from 'express';
import { mlController } from '../controllers/mlController';
// import { authenticate } from '../middleware/authMiddleware'; // Assuming auth is needed

const router = Router();

// router.use(authenticate); // Protect routes

router.get('/conflicts', mlController.getConflicts);
router.post('/resolve', mlController.resolveConflict);

export default router;
