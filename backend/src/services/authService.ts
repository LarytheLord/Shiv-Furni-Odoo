import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";
import { UserRole } from "@prisma/client";

interface RegisterData {
  email: string;
  loginId?: string;
  password: string;
  name: string;
  role?: UserRole;
  contactId?: string;
}

interface LoginData {
  email?: string;
  loginId?: string;
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
    contactType?: string | null;
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
    // Check if email or loginId already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.loginId ? [{ loginId: data.loginId }] : [])
        ]
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new ApiError("Email already registered", 400);
      }
      throw new ApiError("Login ID already taken", 400);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        loginId: data.loginId,
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
    // Find user by email or loginId
    const identifier = data.email || data.loginId;
    if (!identifier) {
      throw new ApiError("Login ID or Email is required", 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { loginId: identifier }
        ]
      },
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
    if (!user.password) {
      throw new ApiError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Fetch contact details if user has a contactId
    let contactType = null;
    if (user.contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: user.contactId },
        select: { type: true },
      });
      contactType = contact?.type;
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
        contactType, // Add contactType to response
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

    if (!user.password) {
      throw new ApiError('User has no password set', 400);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
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
