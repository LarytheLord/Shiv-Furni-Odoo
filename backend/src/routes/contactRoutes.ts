import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { authenticate } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/roleMiddleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/', contactController.getAll);
router.get('/tags', contactController.getTags);
router.get('/vendors', contactController.getVendors);
router.get('/customers', contactController.getCustomers);
router.get(
  '/:id',
  param('id').isUUID(),
  validateRequest,
  contactController.getById,
);
router.get(
  '/:id/stats',
  param('id').isUUID(),
  validateRequest,
  contactController.getStats,
);

router.post(
  '/',
  adminOnly,
  [
    body('name').notEmpty().trim(),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('phone').optional(),
    body('street').optional(),
    body('city').optional(),
    body('state').optional(),
    body('country').optional(),
    body('pincode').optional(),
    body('image').optional(),
    body('tags').optional().isArray(),
    body('type').optional().isIn(['CUSTOMER', 'VENDOR', 'BOTH']),
  ],
  validateRequest,
  contactController.create,
);

router.patch(
  '/:id',
  adminOnly,
  param('id').isUUID(),
  [
    body('name').optional().notEmpty().trim(),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('phone').optional(),
    body('street').optional(),
    body('city').optional(),
    body('state').optional(),
    body('country').optional(),
    body('pincode').optional(),
    body('image').optional(),
    body('tags').optional().isArray(),
    body('type').optional().isIn(['CUSTOMER', 'VENDOR', 'BOTH']),
    body('isActive').optional().isBoolean(),
  ],
  validateRequest,
  contactController.update,
);

router.delete(
  '/:id',
  adminOnly,
  param('id').isUUID(),
  validateRequest,
  contactController.delete,
);

export default router;
