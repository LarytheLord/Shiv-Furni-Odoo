import prisma from '../config/database';
import { budgetService } from './budgetService';
import { AlertType, AlertSeverity, BudgetStatus } from '@prisma/client';

interface AlertCheckResult {
    shouldAlert: boolean;
    alertType: AlertType | null;
    severity: AlertSeverity | null;
    utilizationPercent: number;
}

/**
 * Alert Service
 * 
 * Monitors budget utilization and creates alerts at defined thresholds:
 * - 75%: WARNING (Yellow)
 * - 90%: CRITICAL (Orange)
 * - 100%+: EXCEEDED (Red)
 * 
 * Also tracks underutilization at period end.
 */
export class AlertService {

    /**
     * Check if an alert should be generated for a budget line
     */
    async checkAlertThreshold(
        budgetLineId: string,
        currentSpent: number,
        budgetAmount: number
    ): Promise<AlertCheckResult> {
        if (budgetAmount <= 0) {
            return { shouldAlert: false, alertType: null, severity: null, utilizationPercent: 0 };
        }

        const utilizationPercent = (currentSpent / budgetAmount) * 100;

        // Check for existing unacknowledged alerts for this line
        const existingAlert = await prisma.budgetAlert.findFirst({
            where: {
                budgetLineId,
                isAcknowledged: false
            },
            orderBy: { createdAt: 'desc' }
        });

        // Determine alert type based on utilization
        if (utilizationPercent >= 100) {
            // Only create EXCEEDED alert if no existing EXCEEDED alert
            if (!existingAlert || existingAlert.alertType !== 'EXCEEDED_100') {
                return {
                    shouldAlert: true,
                    alertType: 'EXCEEDED_100',
                    severity: 'CRITICAL',
                    utilizationPercent
                };
            }
        } else if (utilizationPercent >= 90) {
            // Only create CRITICAL alert if no existing CRITICAL or higher
            if (!existingAlert || (existingAlert.alertType !== 'CRITICAL_90' && existingAlert.alertType !== 'EXCEEDED_100')) {
                return {
                    shouldAlert: true,
                    alertType: 'CRITICAL_90',
                    severity: 'HIGH',
                    utilizationPercent
                };
            }
        } else if (utilizationPercent >= 75) {
            // Only create WARNING alert if no existing alerts
            if (!existingAlert) {
                return {
                    shouldAlert: true,
                    alertType: 'WARNING_75',
                    severity: 'MEDIUM',
                    utilizationPercent
                };
            }
        }

        return { shouldAlert: false, alertType: null, severity: null, utilizationPercent };
    }

    /**
     * Create an alert for a budget line
     */
    async createAlert(
        budgetLineId: string,
        budgetId: string,
        alertType: AlertType,
        severity: AlertSeverity,
        currentSpent: number,
        budgetAmount: number,
        utilizationPercent: number
    ) {
        return prisma.budgetAlert.create({
            data: {
                budgetLineId,
                budgetId,
                alertType,
                severity,
                currentSpent,
                budgetAmount,
                utilizationPercent
            },
            include: {
                budgetLine: {
                    include: { analyticalAccount: true }
                },
                budget: true
            }
        });
    }

    /**
     * Process all active budgets and generate alerts
     */
    async processAllBudgets(): Promise<{ alertsCreated: number; budgetsProcessed: number }> {
        const activeBudgets = await prisma.budget.findMany({
            where: {
                status: { in: ['CONFIRMED', 'VALIDATED'] }
            },
            include: {
                budgetLines: {
                    include: { analyticalAccount: true }
                }
            }
        });

        let alertsCreated = 0;

        for (const budget of activeBudgets) {
            for (const line of budget.budgetLines) {
                const metrics = await budgetService.getBudgetLineMetrics(line.id);

                if (metrics) {
                    const result = await this.checkAlertThreshold(
                        line.id,
                        metrics.practicalAmount,
                        metrics.plannedAmount
                    );

                    if (result.shouldAlert && result.alertType && result.severity) {
                        await this.createAlert(
                            line.id,
                            budget.id,
                            result.alertType,
                            result.severity,
                            metrics.practicalAmount,
                            metrics.plannedAmount,
                            result.utilizationPercent
                        );
                        alertsCreated++;
                    }
                }
            }
        }

        return { alertsCreated, budgetsProcessed: activeBudgets.length };
    }

    /**
     * Get all unacknowledged alerts
     */
    async getActiveAlerts(budgetId?: string) {
        return prisma.budgetAlert.findMany({
            where: {
                isAcknowledged: false,
                ...(budgetId && { budgetId })
            },
            include: {
                budgetLine: {
                    include: { analyticalAccount: true }
                },
                budget: true,
                acknowledgedBy: true
            },
            orderBy: [
                { severity: 'desc' },
                { createdAt: 'desc' }
            ]
        });
    }

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(
        alertId: string,
        userId: string,
        actionTaken?: string
    ) {
        return prisma.budgetAlert.update({
            where: { id: alertId },
            data: {
                isAcknowledged: true,
                acknowledgedById: userId,
                acknowledgedAt: new Date(),
                actionTaken
            },
            include: {
                budgetLine: {
                    include: { analyticalAccount: true }
                },
                budget: true,
                acknowledgedBy: true
            }
        });
    }

    /**
     * Get alert statistics
     */
    async getAlertStats() {
        const [total, warning, critical, exceeded, acknowledged] = await Promise.all([
            prisma.budgetAlert.count(),
            prisma.budgetAlert.count({ where: { alertType: 'WARNING_75', isAcknowledged: false } }),
            prisma.budgetAlert.count({ where: { alertType: 'CRITICAL_90', isAcknowledged: false } }),
            prisma.budgetAlert.count({ where: { alertType: 'EXCEEDED_100', isAcknowledged: false } }),
            prisma.budgetAlert.count({ where: { isAcknowledged: true } })
        ]);

        return {
            total,
            active: warning + critical + exceeded,
            byType: {
                warning,
                critical,
                exceeded
            },
            acknowledged
        };
    }

    /**
     * Check for underutilized budgets at period end
     */
    async checkUnderutilization(thresholdPercent: number = 50) {
        const today = new Date();

        const endingBudgets = await prisma.budget.findMany({
            where: {
                status: 'VALIDATED',
                dateTo: {
                    lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // Within 7 days
                }
            },
            include: {
                budgetLines: {
                    include: { analyticalAccount: true }
                }
            }
        });

        const underutilized = [];

        for (const budget of endingBudgets) {
            for (const line of budget.budgetLines) {
                const metrics = await budgetService.getBudgetLineMetrics(line.id);

                if (metrics && metrics.achievementPercent < thresholdPercent) {
                    // Check if alert already exists
                    const existingAlert = await prisma.budgetAlert.findFirst({
                        where: {
                            budgetLineId: line.id,
                            alertType: 'UNDERUTILIZED',
                            isAcknowledged: false
                        }
                    });

                    if (!existingAlert) {
                        const alert = await prisma.budgetAlert.create({
                            data: {
                                budgetLineId: line.id,
                                budgetId: budget.id,
                                alertType: 'UNDERUTILIZED',
                                severity: 'LOW',
                                currentSpent: metrics.practicalAmount,
                                budgetAmount: metrics.plannedAmount,
                                utilizationPercent: metrics.achievementPercent
                            },
                            include: {
                                budgetLine: {
                                    include: { analyticalAccount: true }
                                }
                            }
                        });
                        underutilized.push(alert);
                    }
                }
            }
        }

        return underutilized;
    }
}

export const alertService = new AlertService();
