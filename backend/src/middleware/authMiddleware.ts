import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import prisma from "../config/database";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    contactId?: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  contactId?: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from header
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.authentication) {
      // Support both "Bearer <token>" and just "<token>" in Authentication header
      const authHeader = req.headers.authentication as string;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader;
      }
    }

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "No token provided. Please log in.",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        contactId: true,
      },
    });

    if (!user) {
      res.status(401).json({
        status: "error",
        message: "User no longer exists",
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        status: "error",
        message: "User account is deactivated",
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      contactId: user.contactId || undefined,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "error",
        message: "Token expired. Please log in again.",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: "error",
        message: "Invalid token. Please log in again.",
      });
      return;
    }

    res.status(500).json({
      status: "error",
      message: "Authentication error",
    });
  }
};

export default authMiddleware;

// Alias for backwards compatibility
export const authenticate = authMiddleware;
