import { Router } from 'express';
import { analyticalAccountController } from '../controllers/analyticalAccountController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/', analyticalAccountController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, analyticalAccountController.getById);

router.post('/',
    adminOnly,
    [
        body('code').notEmpty().trim(),
        body('name').notEmpty().trim()
    ],
    validateRequest,
    analyticalAccountController.create
);

router.patch('/:id',
    adminOnly,
    param('id').isUUID(),
    validateRequest,
    analyticalAccountController.update
);

router.delete('/:id', adminOnly, param('id').isUUID(), validateRequest, analyticalAccountController.delete);

export default router;
