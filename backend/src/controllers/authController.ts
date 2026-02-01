import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { AuthRequest } from "../middleware/authMiddleware";

export const authController = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, loginId, password, name, role, contactId } = req.body;

      // Get the uploaded image path if available
      const imagePath = req.file ? req.file.path : undefined;

      const result = await authService.register({
        email,
        loginId,
        password,
        name,
        role,
        contactId,
        imagePath,
      });

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, loginId, password } = req.body;

      const result = await authService.login({ email, loginId, password });

      // Set custom Authentication header
      res.setHeader("Authorization", `Bearer ${result.token}`);
      console.log(result.token);

      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      const user = await authService.getProfile(userId);

      res.status(200).json({
        status: "success",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update password
   * PATCH /api/auth/password
   */
  async updatePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      await authService.updatePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
