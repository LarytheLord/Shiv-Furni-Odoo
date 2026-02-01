import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";
import { userController } from "../controllers/userController";
import { upload } from "../config/multer";

const router = Router();

// Reset Password (Invite Flow & Recovery)
router.post(
  "/reset-password",
  [
    body("token").notEmpty(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validateRequest,
  userController.resetPassword,
);

// Register with optional image upload
router.post(
  "/register",
  upload.single("image"),
  [
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("name").notEmpty().trim(),
    body("role").optional().isIn(["ADMIN", "PORTAL_USER"]),
  ],
  validateRequest,
  authController.register,
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validateRequest,
  authController.login,
);

// Get current user profile
router.get("/me", authenticate, authController.getProfile);

// Update password
router.patch(
  "/password",
  authenticate,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  validateRequest,
  authController.updatePassword,
);

export default router;
