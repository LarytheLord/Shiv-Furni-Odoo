import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { RevisionStatus } from '@prisma/client';

export const budgetRevisionController = {
    /**
     * Get all revisions
     * GET /api/budget-revisions
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, budgetId, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (budgetId) {
                where.budgetId = String(budgetId);
            }

            if (status) {
                where.status = String(status) as RevisionStatus;
            }

            const [revisions, total] = await Promise.all([
                prisma.budgetRevision.findMany({
                    where,
                    include: {
                        budget: {
                            select: { id: true, name: true }
                        },
                        budgetLine: {
                            include: { analyticalAccount: true }
                        },
                        createdBy: {
                            select: { id: true, name: true }
                        },
                        approvedBy: {
                            select: { id: true, name: true }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.budgetRevision.count({ where })
            ]);

            res.status(200).json({
                status: 'success',
                data: { revisions },
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
     * Get revision by ID
     * GET /api/budget-revisions/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const revision = await prisma.budgetRevision.findUnique({
                where: { id },
                include: {
                    budget: true,
                    budgetLine: {
                        include: { analyticalAccount: true }
                    },
                    createdBy: {
                        select: { id: true, name: true, email: true }
                    },
                    approvedBy: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });

            if (!revision) {
                throw new ApiError('Revision not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { revision }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create revision request
     * POST /api/budget-revisions
     */
    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { budgetLineId, newAmount, reason, notes } = req.body;
            const userId = req.user!.id;

            // Get current budget line
            const budgetLine = await prisma.budgetLine.findUnique({
                where: { id: budgetLineId },
                include: { budget: true }
            });

            if (!budgetLine) {
                throw new ApiError('Budget line not found', 404);
            }

            // Get latest revision number
            const lastRevision = await prisma.budgetRevision.findFirst({
                where: { budgetLineId },
                orderBy: { revisionNumber: 'desc' }
            });

            const revisionNumber = (lastRevision?.revisionNumber || 0) + 1;
            const previousAmount = Number(budgetLine.plannedAmount);
            const variance = newAmount - previousAmount;
            const variancePercent = previousAmount > 0
                ? (variance / previousAmount) * 100
                : 0;

            const revision = await prisma.budgetRevision.create({
                data: {
                    budgetLineId,
                    budgetId: budgetLine.budgetId,
                    revisionNumber,
                    previousAmount,
                    newAmount,
                    variance,
                    variancePercent,
                    reason,
                    notes,
                    createdById: userId
                },
                include: {
                    budgetLine: {
                        include: { analyticalAccount: true }
                    },
                    budget: {
                        select: { id: true, name: true }
                    },
                    createdBy: {
                        select: { id: true, name: true }
                    }
                }
            });

            res.status(201).json({
                status: 'success',
                message: 'Revision request created successfully',
                data: { revision }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Submit revision for approval
     * POST /api/budget-revisions/:id/submit
     */
    async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const revision = await prisma.budgetRevision.update({
                where: { id },
                data: { status: 'SUBMITTED' },
                include: {
                    budgetLine: {
                        include: { analyticalAccount: true }
                    }
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Revision submitted for approval',
                data: { revision }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Approve revision
     * POST /api/budget-revisions/:id/approve
     */
    async approve(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            const revision = await prisma.budgetRevision.findUnique({
                where: { id }
            });

            if (!revision) {
                throw new ApiError('Revision not found', 404);
            }

            if (revision.status !== 'SUBMITTED') {
                throw new ApiError('Only submitted revisions can be approved', 400);
            }

            // Update revision status
            const updatedRevision = await prisma.budgetRevision.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    approvedById: userId,
                    approvedAt: new Date()
                }
            });

            // Update budget line with new amount
            await prisma.budgetLine.update({
                where: { id: revision.budgetLineId },
                data: { plannedAmount: revision.newAmount }
            });

            res.status(200).json({
                status: 'success',
                message: 'Revision approved and budget updated',
                data: { revision: updatedRevision }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Reject revision
     * POST /api/budget-revisions/:id/reject
     */
    async reject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { rejectionReason } = req.body;
            const userId = req.user!.id;

            const revision = await prisma.budgetRevision.findUnique({
                where: { id }
            });

            if (!revision) {
                throw new ApiError('Revision not found', 404);
            }

            if (revision.status !== 'SUBMITTED') {
                throw new ApiError('Only submitted revisions can be rejected', 400);
            }

            const updatedRevision = await prisma.budgetRevision.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    approvedById: userId,
                    approvedAt: new Date(),
                    rejectionReason
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Revision rejected',
                data: { revision: updatedRevision }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Cancel revision
     * POST /api/budget-revisions/:id/cancel
     */
    async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const revision = await prisma.budgetRevision.findUnique({
                where: { id }
            });

            if (!revision) {
                throw new ApiError('Revision not found', 404);
            }

            if (!['DRAFT', 'SUBMITTED'].includes(revision.status)) {
                throw new ApiError('Only draft or submitted revisions can be cancelled', 400);
            }

            const updatedRevision = await prisma.budgetRevision.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });

            res.status(200).json({
                status: 'success',
                message: 'Revision cancelled',
                data: { revision: updatedRevision }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get revision history for a budget line
     * GET /api/budget-revisions/history/:budgetLineId
     */
    async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { budgetLineId } = req.params;

            const revisions = await prisma.budgetRevision.findMany({
                where: { budgetLineId },
                include: {
                    createdBy: {
                        select: { id: true, name: true }
                    },
                    approvedBy: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { revisionNumber: 'desc' }
            });

            res.status(200).json({
                status: 'success',
                data: { revisions }
            });
        } catch (error) {
            next(error);
        }
    }
};

export default budgetRevisionController;
