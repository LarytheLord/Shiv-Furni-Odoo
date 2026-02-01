import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { emailService } from '../services/emailService';

export const userController = {
    /**
     * Get all users
     * GET /api/users
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, search, role } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (search) {
                where.OR = [
                    { name: { contains: String(search), mode: 'insensitive' } },
                    { email: { contains: String(search), mode: 'insensitive' } },
                    { loginId: { contains: String(search), mode: 'insensitive' } }
                ];
            }

            if (role) {
                where.role = String(role);
            }

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        loginId: true,
                        email: true,
                        name: true,
                        role: true,
                        isActive: true,
                        contactId: true,
                        contact: {
                            select: { id: true, name: true, type: true }
                        },
                        createdAt: true
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count({ where })
            ]);

            res.status(200).json({
                status: 'success',
                data: { users },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get user by ID
     * GET /api/users/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    loginId: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    contactId: true,
                    contact: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                throw new ApiError('User not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create user (Invite Flow)
     * POST /api/users
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, loginId, name, role, contactId } = req.body;
            // Removed password from required inputs

            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email },
                        ...(loginId ? [{ loginId }] : [])
                    ]
                }
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    throw new ApiError('Email already registered', 400);
                }
                throw new ApiError('Login ID already taken', 400);
            }

            // Generate Invitation Token
            const token = crypto.randomBytes(32).toString('hex');
            const expires = new Date();
            expires.setHours(expires.getHours() + 24); // 24 hour expiry

            const user = await prisma.user.create({
                data: {
                    email,
                    loginId,
                    name,
                    role: role || 'PORTAL_USER',
                    contactId,
                    resetPasswordToken: token,
                    resetPasswordExpires: expires
                },
                select: {
                    id: true,
                    loginId: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    contactId: true,
                    createdAt: true
                }
            });

            // Send Invitation Email
            try {
                await emailService.sendInvitation(email, token);
            } catch (emailError) {
                console.error('Failed to send invitation email:', emailError);
                // Don't fail the request, but maybe warn? 
                // For now, we assume admin can re-invite if needed.
            }

            res.status(201).json({
                status: 'success',
                message: 'User invited successfully. Check email for details.',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update user
     * PATCH /api/users/:id
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, email, loginId, role, isActive, contactId } = req.body;

            // Check if loginId or email is taken by other user
            if (loginId || email) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            ...(email ? [{ email }] : []),
                            ...(loginId ? [{ loginId }] : [])
                        ],
                        NOT: { id }
                    }
                });

                if (existingUser) {
                    throw new ApiError('Email or Login ID already taken', 400);
                }
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(loginId && { loginId }),
                    ...(role && { role }),
                    ...(typeof isActive === 'boolean' && { isActive }),
                    ...(contactId !== undefined && { contactId })
                },
                select: {
                    id: true,
                    loginId: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    contactId: true,
                    updatedAt: true
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete user
     * DELETE /api/users/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            await prisma.user.delete({
                where: { id }
            });

            res.status(200).json({
                status: 'success',
                message: 'User deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Toggle user active status
     * PATCH /api/users/:id/toggle-active
     */
    async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id },
                select: { isActive: true }
            });

            if (!user) {
                throw new ApiError('User not found', 404);
            }

            const updated = await prisma.user.update({
                where: { id },
                data: { isActive: !user.isActive },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    isActive: true
                }
            });

            res.status(200).json({
                status: 'success',
                message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
                data: { user: updated }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Reset Password
     * POST /api/auth/reset-password
     */
    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, password } = req.body;

            const user = await prisma.user.findFirst({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        gt: new Date()
                    }
                }
            });

            if (!user) {
                throw new ApiError('Password reset token is invalid or has expired', 400);
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                    isActive: true // Activate user if it was pending
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Password has been reset successfully'
            });
        } catch (error) {
            next(error);
        }
    }
};

export default userController;
