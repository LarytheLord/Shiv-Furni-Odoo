import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { budgetService } from '../services/budgetService';
import { alertService } from '../services/alertService';
import { pdfService } from '../services/pdfService';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { BudgetStatus } from '@prisma/client';

export const budgetController = {
    /**
     * Get all budgets
     * GET /api/budgets
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, search, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (search) {
                where.name = { contains: String(search), mode: 'insensitive' };
            }

            if (status) {
                where.status = String(status) as BudgetStatus;
            }

            const [budgets, total] = await Promise.all([
                prisma.budget.findMany({
                    where,
                    include: {
                        createdBy: {
                            select: { id: true, name: true }
                        },
                        _count: {
                            select: { budgetLines: true, alerts: true }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.budget.count({ where })
            ]);

            res.status(200).json({
                status: 'success',
                data: { budgets },
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
     * Get budget by ID with metrics
     * GET /api/budgets/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const budget = await prisma.budget.findUnique({
                where: { id },
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true }
                    },
                    budgetLines: {
                        include: {
                            analyticalAccount: true
                        }
                    },
                    alerts: {
                        where: { isAcknowledged: false },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });

            if (!budget) {
                throw new ApiError('Budget not found', 404);
            }

            // Get metrics for each line
            const linesWithMetrics = await budgetService.getBudgetWithMetrics(id);

            res.status(200).json({
                status: 'success',
                data: {
                    budget,
                    linesWithMetrics
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create budget
     * POST /api/budgets
     */
    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, dateFrom, dateTo, description, lines } = req.body;
            const userId = req.user!.id;

            const budget = await prisma.budget.create({
                data: {
                    name,
                    dateFrom: new Date(dateFrom),
                    dateTo: new Date(dateTo),
                    description,
                    createdById: userId,
                    budgetLines: {
                        create: lines.map((line: any) => ({
                            analyticalAccountId: line.analyticalAccountId,
                            plannedAmount: line.plannedAmount,
                            originalPlannedAmount: line.plannedAmount
                        }))
                    }
                },
                include: {
                    budgetLines: {
                        include: { analyticalAccount: true }
                    },
                    createdBy: {
                        select: { id: true, name: true }
                    }
                }
            });

            res.status(201).json({
                status: 'success',
                message: 'Budget created successfully',
                data: { budget }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update budget
     * PATCH /api/budgets/:id
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, dateFrom, dateTo, description, status } = req.body;

            const budget = await prisma.budget.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(dateFrom && { dateFrom: new Date(dateFrom) }),
                    ...(dateTo && { dateTo: new Date(dateTo) }),
                    ...(description !== undefined && { description }),
                    ...(status && { status })
                },
                include: {
                    budgetLines: {
                        include: { analyticalAccount: true }
                    }
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Budget updated successfully',
                data: { budget }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete budget
     * DELETE /api/budgets/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const budget = await prisma.budget.findUnique({ where: { id } });

            if (!budget) {
                throw new ApiError('Budget not found', 404);
            }

            if (budget.status !== 'DRAFT') {
                throw new ApiError('Only draft budgets can be deleted', 400);
            }

            await prisma.budget.delete({ where: { id } });

            res.status(200).json({
                status: 'success',
                message: 'Budget deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Add budget line
     * POST /api/budgets/:id/lines
     */
    async addLine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { analyticalAccountId, plannedAmount } = req.body;

            const existingLine = await prisma.budgetLine.findFirst({
                where: { budgetId: id, analyticalAccountId }
            });

            if (existingLine) {
                throw new ApiError('Budget line for this cost center already exists', 400);
            }

            const line = await prisma.budgetLine.create({
                data: {
                    budgetId: id,
                    analyticalAccountId,
                    plannedAmount,
                    originalPlannedAmount: plannedAmount
                },
                include: { analyticalAccount: true }
            });

            res.status(201).json({
                status: 'success',
                message: 'Budget line added successfully',
                data: { line }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update budget line
     * PATCH /api/budgets/:id/lines/:lineId
     */
    async updateLine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lineId } = req.params;
            const { plannedAmount } = req.body;

            const line = await prisma.budgetLine.update({
                where: { id: lineId },
                data: { plannedAmount },
                include: { analyticalAccount: true }
            });

            // Check if we need to create an alert
            const metrics = await budgetService.getBudgetLineMetrics(lineId);
            if (metrics) {
                await alertService.checkAlertThreshold(
                    lineId,
                    metrics.practicalAmount,
                    plannedAmount
                );
            }

            res.status(200).json({
                status: 'success',
                message: 'Budget line updated successfully',
                data: { line }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete budget line
     * DELETE /api/budgets/:id/lines/:lineId
     */
    async deleteLine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lineId } = req.params;

            await prisma.budgetLine.delete({ where: { id: lineId } });

            res.status(200).json({
                status: 'success',
                message: 'Budget line deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Confirm budget
     * POST /api/budgets/:id/confirm
     */
    async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const budget = await prisma.budget.update({
                where: { id },
                data: { status: 'CONFIRMED' }
            });

            res.status(200).json({
                status: 'success',
                message: 'Budget confirmed successfully',
                data: { budget }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Validate budget
     * POST /api/budgets/:id/validate
     */
    async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const budget = await prisma.budget.update({
                where: { id },
                data: { status: 'VALIDATED' }
            });

            res.status(200).json({
                status: 'success',
                message: 'Budget validated successfully',
                data: { budget }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get budget metrics
     * GET /api/budgets/:id/metrics
     */
    async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const linesWithMetrics = await budgetService.getBudgetWithMetrics(id);

            // Calculate totals
            const totals = linesWithMetrics.reduce(
                (acc, line) => ({
                    planned: acc.planned + line.metrics.plannedAmount,
                    practical: acc.practical + line.metrics.practicalAmount,
                    theoretical: acc.theoretical + line.metrics.theoreticalAmount,
                    remaining: acc.remaining + line.metrics.remainingAmount
                }),
                { planned: 0, practical: 0, theoretical: 0, remaining: 0 }
            );

            res.status(200).json({
                status: 'success',
                data: {
                    lines: linesWithMetrics,
                    totals: {
                        ...totals,
                        achievementPercent: totals.planned > 0
                            ? Math.round((totals.practical / totals.planned) * 100)
                            : 0
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Simulate budget changes
     * POST /api/budgets/:id/simulate
     */
    async simulate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { adjustments } = req.body;

            const simulation = await budgetService.simulateBudget(id, adjustments);

            if (!simulation) {
                throw new ApiError('Budget not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { simulation }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Export budget report as PDF
     * GET /api/budgets/:id/export-pdf
     */
    async exportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const budget = await prisma.budget.findUnique({
                where: { id },
                include: {
                    budgetLines: {
                        include: { analyticalAccount: true }
                    }
                }
            });

            if (!budget) {
                throw new ApiError('Budget not found', 404);
            }

            const linesWithMetrics = await budgetService.getBudgetWithMetrics(id);

            const totals = linesWithMetrics.reduce(
                (acc, line) => ({
                    planned: acc.planned + line.metrics.plannedAmount,
                    actual: acc.actual + line.metrics.practicalAmount
                }),
                { planned: 0, actual: 0 }
            );

            const pdfBuffer = await pdfService.generateBudgetReportPdf({
                name: budget.name,
                period: { from: budget.dateFrom, to: budget.dateTo },
                lines: linesWithMetrics.map(line => ({
                    costCenter: `${line.analyticalAccountCode} - ${line.analyticalAccountName}`,
                    planned: line.metrics.plannedAmount,
                    actual: line.metrics.practicalAmount,
                    achievement: line.metrics.achievementPercent,
                    status: line.alertStatus
                })),
                totals: {
                    planned: totals.planned,
                    actual: totals.actual,
                    achievement: totals.planned > 0 ? Math.round((totals.actual / totals.planned) * 100) : 0
                }
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=budget-report-${budget.name}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }
};

export default budgetController;
