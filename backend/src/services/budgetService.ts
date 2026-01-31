import prisma from '../config/database';

interface BudgetMetrics {
    plannedAmount: number;
    practicalAmount: number;      // Actual spent
    theoreticalAmount: number;    // What should be spent by now
    achievementPercent: number;   // (Practical / Planned) * 100
    remainingAmount: number;      // Planned - Practical
    periodElapsedPercent: number; // How much of budget period has passed
    varianceAmount: number;       // Theoretical - Practical (positive = under budget)
    variancePercent: number;      // Variance as percentage of theoretical
}

interface BudgetLineWithMetrics {
    id: string;
    analyticalAccountId: string;
    analyticalAccountName: string;
    analyticalAccountCode: string;
    metrics: BudgetMetrics;
    alertStatus: 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
}

interface CostCenterSummary {
    id: string;
    code: string;
    name: string;
    planned: number;
    actual: number;
    percent: number;
    status: 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
}

/**
 * Budget Service
 * 
 * Handles all budget calculations including:
 * - Practical Amount (actual spent from bills/invoices)
 * - Theoretical Amount (prorated budget based on time elapsed)
 * - Achievement Percentage
 * - Remaining Amount
 * - Variance Analysis
 */
export class BudgetService {

    /**
     * Calculate practical amount (actual spent) for a budget line
     * 
     * Sums up all confirmed vendor bill lines that are linked to 
     * this analytical account within the budget period
     */
    async calculatePracticalAmount(
        analyticalAccountId: string,
        dateFrom: Date,
        dateTo: Date
    ): Promise<number> {
        // Sum vendor bill lines (expenses)
        const vendorBillSum = await prisma.vendorBillLine.aggregate({
            where: {
                analyticalAccountId,
                vendorBill: {
                    status: { in: ['CONFIRMED', 'PAID', 'PARTIALLY_PAID'] },
                    billDate: {
                        gte: dateFrom,
                        lte: dateTo
                    }
                }
            },
            _sum: { total: true }
        });

        const spent = Number(vendorBillSum._sum.total || 0);
        return Math.round(spent * 100) / 100;
    }

    /**
     * Calculate revenue for a cost center (from customer invoices)
     */
    async calculateRevenue(
        analyticalAccountId: string,
        dateFrom: Date,
        dateTo: Date
    ): Promise<number> {
        const invoiceSum = await prisma.customerInvoiceLine.aggregate({
            where: {
                analyticalAccountId,
                customerInvoice: {
                    status: { in: ['CONFIRMED', 'PAID', 'PARTIALLY_PAID'] },
                    invoiceDate: {
                        gte: dateFrom,
                        lte: dateTo
                    }
                }
            },
            _sum: { total: true }
        });

        return Math.round(Number(invoiceSum._sum.total || 0) * 100) / 100;
    }

    /**
     * Calculate theoretical amount
     * 
     * Formula: Planned × (Days Elapsed / Total Days)
     * 
     * Example: Budget is ₹100,000 for Jan-Dec (365 days)
     * If today is March 31 (90 days elapsed):
     * Theoretical = 100,000 × (90/365) = ₹24,657
     */
    calculateTheoreticalAmount(
        plannedAmount: number,
        dateFrom: Date,
        dateTo: Date
    ): number {
        const today = new Date();
        const totalDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));

        if (totalDays <= 0) return plannedAmount;
        if (today < dateFrom) return 0;
        if (today > dateTo) return plannedAmount;

        const elapsedDays = Math.ceil((today.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
        const theoretical = plannedAmount * (elapsedDays / totalDays);

        return Math.round(theoretical * 100) / 100;
    }

    /**
     * Calculate period elapsed percentage
     */
    calculatePeriodElapsed(dateFrom: Date, dateTo: Date): number {
        const today = new Date();
        const totalDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));

        if (totalDays <= 0) return 100;
        if (today < dateFrom) return 0;
        if (today > dateTo) return 100;

        const elapsedDays = Math.ceil((today.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
        return Math.round((elapsedDays / totalDays) * 100 * 100) / 100;
    }

    /**
     * Determine alert status based on achievement percentage
     */
    getAlertStatus(achievementPercent: number): 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED' {
        if (achievementPercent >= 100) return 'EXCEEDED';
        if (achievementPercent >= 90) return 'CRITICAL';
        if (achievementPercent >= 75) return 'WARNING';
        return 'OK';
    }

    /**
     * Get complete metrics for a budget line
     */
    async getBudgetLineMetrics(
        budgetLineId: string
    ): Promise<BudgetMetrics | null> {
        const budgetLine = await prisma.budgetLine.findUnique({
            where: { id: budgetLineId },
            include: {
                budget: true,
                analyticalAccount: true
            }
        });

        if (!budgetLine) return null;

        const planned = Number(budgetLine.plannedAmount);
        const practical = await this.calculatePracticalAmount(
            budgetLine.analyticalAccountId,
            budgetLine.budget.dateFrom,
            budgetLine.budget.dateTo
        );
        const theoretical = this.calculateTheoreticalAmount(
            planned,
            budgetLine.budget.dateFrom,
            budgetLine.budget.dateTo
        );
        const periodElapsed = this.calculatePeriodElapsed(
            budgetLine.budget.dateFrom,
            budgetLine.budget.dateTo
        );

        const achievementPercent = planned > 0 ? Math.round((practical / planned) * 100 * 100) / 100 : 0;
        const varianceAmount = theoretical - practical;
        const variancePercent = theoretical > 0 ? Math.round((varianceAmount / theoretical) * 100 * 100) / 100 : 0;

        return {
            plannedAmount: planned,
            practicalAmount: practical,
            theoreticalAmount: theoretical,
            achievementPercent,
            remainingAmount: Math.round((planned - practical) * 100) / 100,
            periodElapsedPercent: periodElapsed,
            varianceAmount: Math.round(varianceAmount * 100) / 100,
            variancePercent
        };
    }

    /**
     * Get all budget lines with full metrics for a budget
     */
    async getBudgetWithMetrics(budgetId: string): Promise<BudgetLineWithMetrics[]> {
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: {
                budgetLines: {
                    include: { analyticalAccount: true }
                }
            }
        });

        if (!budget) return [];

        const results: BudgetLineWithMetrics[] = [];

        for (const line of budget.budgetLines) {
            const metrics = await this.getBudgetLineMetrics(line.id);

            if (metrics) {
                results.push({
                    id: line.id,
                    analyticalAccountId: line.analyticalAccountId,
                    analyticalAccountName: line.analyticalAccount.name,
                    analyticalAccountCode: line.analyticalAccount.code,
                    metrics,
                    alertStatus: this.getAlertStatus(metrics.achievementPercent)
                });
            }
        }

        return results;
    }

    /**
     * Get dashboard summary for all validated budgets
     */
    async getDashboardSummary() {
        const budgets = await prisma.budget.findMany({
            where: { status: { in: ['VALIDATED', 'CONFIRMED'] } },
            include: {
                budgetLines: {
                    include: { analyticalAccount: true }
                }
            }
        });

        let totalPlanned = 0;
        let totalPractical = 0;
        const costCenterSummary: CostCenterSummary[] = [];
        const costCenterMap = new Map<string, { planned: number; actual: number }>();

        for (const budget of budgets) {
            for (const line of budget.budgetLines) {
                const planned = Number(line.plannedAmount);
                const practical = await this.calculatePracticalAmount(
                    line.analyticalAccountId,
                    budget.dateFrom,
                    budget.dateTo
                );

                totalPlanned += planned;
                totalPractical += practical;

                // Aggregate by cost center
                const existing = costCenterMap.get(line.analyticalAccountId);
                if (existing) {
                    existing.planned += planned;
                    existing.actual += practical;
                } else {
                    costCenterMap.set(line.analyticalAccountId, {
                        planned,
                        actual: practical
                    });
                }
            }
        }

        // Build cost center summary
        for (const budget of budgets) {
            for (const line of budget.budgetLines) {
                const data = costCenterMap.get(line.analyticalAccountId);
                if (data && !costCenterSummary.find(c => c.id === line.analyticalAccountId)) {
                    const percent = data.planned > 0 ? Math.round((data.actual / data.planned) * 100) : 0;
                    costCenterSummary.push({
                        id: line.analyticalAccountId,
                        code: line.analyticalAccount.code,
                        name: line.analyticalAccount.name,
                        planned: data.planned,
                        actual: data.actual,
                        percent,
                        status: this.getAlertStatus(percent)
                    });
                }
            }
        }

        // Recent alerts
        const recentAlerts = await prisma.budgetAlert.findMany({
            where: { isAcknowledged: false },
            include: {
                budgetLine: {
                    include: { analyticalAccount: true }
                },
                budget: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return {
            totalPlanned: Math.round(totalPlanned * 100) / 100,
            totalPractical: Math.round(totalPractical * 100) / 100,
            totalRemaining: Math.round((totalPlanned - totalPractical) * 100) / 100,
            overallAchievement: totalPlanned > 0 ? Math.round((totalPractical / totalPlanned) * 100) : 0,
            costCenterSummary: costCenterSummary.sort((a, b) => b.percent - a.percent),
            recentAlerts: recentAlerts.map(alert => ({
                id: alert.id,
                alertType: alert.alertType,
                severity: alert.severity,
                costCenter: alert.budgetLine.analyticalAccount.name,
                budgetName: alert.budget.name,
                utilizationPercent: Number(alert.utilizationPercent),
                createdAt: alert.createdAt
            })),
            activeBudgetsCount: budgets.length
        };
    }

    /**
     * Simulate budget scenario (what-if analysis)
     */
    async simulateBudget(budgetId: string, adjustments: { lineId: string; newAmount: number }[]) {
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: {
                budgetLines: {
                    include: { analyticalAccount: true }
                }
            }
        });

        if (!budget) return null;

        const simulatedLines = [];

        for (const line of budget.budgetLines) {
            const adjustment = adjustments.find(a => a.lineId === line.id);
            const plannedAmount = adjustment ? adjustment.newAmount : Number(line.plannedAmount);

            const practical = await this.calculatePracticalAmount(
                line.analyticalAccountId,
                budget.dateFrom,
                budget.dateTo
            );

            const achievementPercent = plannedAmount > 0 ? Math.round((practical / plannedAmount) * 100) : 0;

            simulatedLines.push({
                id: line.id,
                analyticalAccount: line.analyticalAccount.name,
                originalPlanned: Number(line.plannedAmount),
                simulatedPlanned: plannedAmount,
                currentSpent: practical,
                simulatedAchievement: achievementPercent,
                simulatedStatus: this.getAlertStatus(achievementPercent)
            });
        }

        return {
            budgetName: budget.name,
            period: {
                from: budget.dateFrom,
                to: budget.dateTo
            },
            simulatedLines
        };
    }
}

export const budgetService = new BudgetService();
