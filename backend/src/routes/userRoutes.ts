import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', userController.getAll);
router.get('/:id', param('id').isUUID(), validateRequest, userController.getById);

router.post('/',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 }),
        body('name').notEmpty().trim(),
        body('role').optional().isIn(['ADMIN', 'PORTAL_USER'])
    ],
    validateRequest,
    userController.create
);

router.patch('/:id',
    param('id').isUUID(),
    [
        body('email').optional().isEmail().normalizeEmail(),
        body('name').optional().notEmpty().trim(),
        body('role').optional().isIn(['ADMIN', 'PORTAL_USER']),
        body('isActive').optional().isBoolean()
    ],
    validateRequest,
    userController.update
);

router.delete('/:id', param('id').isUUID(), validateRequest, userController.delete);
router.patch('/:id/toggle-active', param('id').isUUID(), validateRequest, userController.toggleActive);

export default router;
