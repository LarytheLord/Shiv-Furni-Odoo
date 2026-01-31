import { Request, Response, NextFunction } from 'express';
import { alertService } from '../services/alertService';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export const budgetAlertController = {
    /**
     * Get all alerts
     * GET /api/budget-alerts
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { budgetId, isAcknowledged, severity, type } = req.query;

            const where: any = {};

            if (budgetId) {
                where.budgetId = String(budgetId);
            }

            if (isAcknowledged !== undefined) {
                where.isAcknowledged = isAcknowledged === 'true';
            }

            if (severity) {
                where.severity = String(severity);
            }

            if (type) {
                where.alertType = String(type);
            }

            const alerts = await prisma.budgetAlert.findMany({
                where,
                include: {
                    budget: {
                        select: { id: true, name: true }
                    },
                    budgetLine: {
                        include: { analyticalAccount: true }
                    },
                    acknowledgedBy: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: [
                    { isAcknowledged: 'asc' },
                    { severity: 'desc' },
                    { createdAt: 'desc' }
                ]
            });

            res.status(200).json({
                status: 'success',
                data: { alerts }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get active (unacknowledged) alerts
     * GET /api/budget-alerts/active
     */
    async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { budgetId } = req.query;

            const alerts = await alertService.getActiveAlerts(
                budgetId ? String(budgetId) : undefined
            );

            res.status(200).json({
                status: 'success',
                data: { alerts }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get alert statistics
     * GET /api/budget-alerts/stats
     */
    async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await alertService.getAlertStats();

            res.status(200).json({
                status: 'success',
                data: { stats }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Acknowledge alert
     * POST /api/budget-alerts/:id/acknowledge
     */
    async acknowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { actionTaken } = req.body;
            const userId = req.user!.id;

            const alert = await alertService.acknowledgeAlert(id, userId, actionTaken);

            res.status(200).json({
                status: 'success',
                message: 'Alert acknowledged',
                data: { alert }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Bulk acknowledge alerts
     * POST /api/budget-alerts/bulk-acknowledge
     */
    async bulkAcknowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { alertIds, actionTaken } = req.body;
            const userId = req.user!.id;

            const updates = alertIds.map((id: string) =>
                prisma.budgetAlert.update({
                    where: { id },
                    data: {
                        isAcknowledged: true,
                        acknowledgedById: userId,
                        acknowledgedAt: new Date(),
                        actionTaken
                    }
                })
            );

            await prisma.$transaction(updates);

            res.status(200).json({
                status: 'success',
                message: `${alertIds.length} alerts acknowledged`
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Process all budgets for alerts
     * POST /api/budget-alerts/process
     */
    async processAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await alertService.processAllBudgets();

            res.status(200).json({
                status: 'success',
                message: `Processed ${result.budgetsProcessed} budgets, created ${result.alertsCreated} alerts`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Check for underutilized budgets
     * POST /api/budget-alerts/check-underutilization
     */
    async checkUnderutilization(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { threshold = 50 } = req.body;

            const alerts = await alertService.checkUnderutilization(Number(threshold));

            res.status(200).json({
                status: 'success',
                message: `Found ${alerts.length} underutilized budget lines`,
                data: { alerts }
            });
        } catch (error) {
            next(error);
        }
    }
};

export default budgetAlertController;
