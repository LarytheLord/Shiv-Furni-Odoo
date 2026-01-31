import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";
import { UserRole } from "@prisma/client";

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  contactId?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  contactId?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    contactId?: string | null;
  };
  token: string;
}

export class AuthService {
  /**
   * Generate JWT token
   */
  private generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError("Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || "PORTAL_USER",
        contactId: data.contactId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        contactId: true,
      },
    });

    // Generate token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      contactId: user.contactId || undefined,
    });

    return { user, token };
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
        contactId: true,
      },
    });

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new ApiError("Account is deactivated. Please contact admin.", 401);
    }

    // Check password
    const isValidPassword = await this.comparePassword(
      data.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Generate token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      contactId: user.contactId || undefined,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        contactId: user.contactId,
      },
      token,
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        contactId: true,
        contact: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  }

  /**
   * Update password
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const isValidPassword = await this.comparePassword(
      currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new ApiError("Current password is incorrect", 400);
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}

export const authService = new AuthService();
