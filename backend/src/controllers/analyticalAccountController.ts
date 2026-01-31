import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

export const analyticalAccountController = {
    /**
     * Get all analytical accounts
     * GET /api/analytical-accounts
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, isActive } = req.query;

            const where: any = {};

            if (search) {
                where.OR = [
                    { name: { contains: String(search), mode: 'insensitive' } },
                    { code: { contains: String(search), mode: 'insensitive' } },
                    { description: { contains: String(search), mode: 'insensitive' } }
                ];
            }

            if (isActive !== undefined) {
                where.isActive = isActive === 'true';
            }

            const accounts = await prisma.analyticalAccount.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            budgetLines: true,
                            autoAnalyticalRules: true
                        }
                    }
                },
                orderBy: { code: 'asc' }
            });

            res.status(200).json({
                status: 'success',
                data: { accounts }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get analytical account by ID
     * GET /api/analytical-accounts/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const account = await prisma.analyticalAccount.findUnique({
                where: { id },
                include: {
                    budgetLines: {
                        include: {
                            budget: {
                                select: { id: true, name: true, status: true, dateFrom: true, dateTo: true }
                            }
                        }
                    },
                    autoAnalyticalRules: {
                        where: { isActive: true },
                        select: { id: true, name: true, sequence: true }
                    }
                }
            });

            if (!account) {
                throw new ApiError('Analytical account not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { account }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create analytical account
     * POST /api/analytical-accounts
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code, name, description } = req.body;

            const existing = await prisma.analyticalAccount.findUnique({ where: { code } });
            if (existing) {
                throw new ApiError('Account code already exists', 400);
            }

            const account = await prisma.analyticalAccount.create({
                data: { code, name, description }
            });

            res.status(201).json({
                status: 'success',
                message: 'Analytical account created successfully',
                data: { account }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update analytical account
     * PATCH /api/analytical-accounts/:id
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { code, name, description, isActive } = req.body;

            if (code) {
                const existing = await prisma.analyticalAccount.findFirst({
                    where: { code, NOT: { id } }
                });
                if (existing) {
                    throw new ApiError('Account code already exists', 400);
                }
            }

            const account = await prisma.analyticalAccount.update({
                where: { id },
                data: {
                    ...(code && { code }),
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(typeof isActive === 'boolean' && { isActive })
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Analytical account updated successfully',
                data: { account }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete analytical account
     * DELETE /api/analytical-accounts/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const budgetLines = await prisma.budgetLine.count({ where: { analyticalAccountId: id } });

            if (budgetLines > 0) {
                await prisma.analyticalAccount.update({
                    where: { id },
                    data: { isActive: false }
                });

                res.status(200).json({
                    status: 'success',
                    message: 'Account deactivated (used in budgets)'
                });
                return;
            }

            await prisma.analyticalAccount.delete({ where: { id } });

            res.status(200).json({
                status: 'success',
                message: 'Analytical account deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
};

export default analyticalAccountController;
