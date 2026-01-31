import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { UserRole } from '@prisma/client';

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
            return;
        }

        next();
    };
};

// Convenience middleware for admin-only routes
export const adminOnly = roleMiddleware('ADMIN');

// Convenience middleware for portal users (own data access)
export const portalAccess = roleMiddleware('ADMIN', 'PORTAL_USER');

export default roleMiddleware;
