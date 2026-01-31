import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { budgetService } from '../services/budgetService';
import { alertService } from '../services/alertService';

export const dashboardController = {
    async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Get active budgets
            const activeBudgets = await prisma.budget.findMany({
                where: { status: { in: ['CONFIRMED', 'VALIDATED'] } },
                include: { budgetLines: { include: { analyticalAccount: true } } }
            });

            let totalPlanned = 0, totalPractical = 0;
            const costCenterSummary: any[] = [];

            for (const budget of activeBudgets) {
                const metrics = await budgetService.getBudgetWithMetrics(budget.id);
                for (const line of metrics) {
                    totalPlanned += line.metrics.plannedAmount;
                    totalPractical += line.metrics.practicalAmount;
                    costCenterSummary.push({
                        id: line.analyticalAccountId,
                        code: line.analyticalAccountCode,
                        name: line.analyticalAccountName,
                        planned: line.metrics.plannedAmount,
                        actual: line.metrics.practicalAmount,
                        percent: line.metrics.achievementPercent,
                        status: line.alertStatus
                    });
                }
            }

            const recentAlerts = await prisma.budgetAlert.findMany({
                where: { isAcknowledged: false },
                include: { budget: { select: { name: true } }, budgetLine: { include: { analyticalAccount: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5
            });

            res.json({
                status: 'success',
                data: {
                    summary: {
                        totalPlanned,
                        totalPractical,
                        totalRemaining: totalPlanned - totalPractical,
                        overallAchievement: totalPlanned > 0 ? Math.round((totalPractical / totalPlanned) * 100) : 0,
                        activeBudgetsCount: activeBudgets.length,
                        costCenterSummary,
                        recentAlerts: recentAlerts.map(a => ({
                            id: a.id, alertType: a.alertType, severity: a.severity,
                            costCenter: a.budgetLine.analyticalAccount.name,
                            budgetName: a.budget.name,
                            utilizationPercent: Number(a.utilizationPercent),
                            createdAt: a.createdAt
                        }))
                    }
                }
            });
        } catch (error) { next(error); }
    },

    async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const [contacts, products, purchaseOrders, salesOrders, vendorBills, customerInvoices, budgets, alerts] = await Promise.all([
                prisma.contact.count({ where: { isActive: true } }),
                prisma.product.count({ where: { isActive: true } }),
                prisma.purchaseOrder.count(),
                prisma.salesOrder.count(),
                prisma.vendorBill.aggregate({ _sum: { total: true }, _count: true }),
                prisma.customerInvoice.aggregate({ _sum: { total: true }, _count: true }),
                prisma.budget.count({ where: { status: { in: ['CONFIRMED', 'VALIDATED'] } } }),
                prisma.budgetAlert.count({ where: { isAcknowledged: false } })
            ]);

            const pendingBills = await prisma.vendorBill.aggregate({
                where: { status: { in: ['CONFIRMED', 'PARTIALLY_PAID'] } },
                _sum: { amountDue: true }
            });

            const pendingInvoices = await prisma.customerInvoice.aggregate({
                where: { status: { in: ['CONFIRMED', 'PARTIALLY_PAID'] } },
                _sum: { amountDue: true }
            });

            res.json({
                status: 'success',
                data: {
                    stats: {
                        contacts, products, purchaseOrders, salesOrders,
                        vendorBillsCount: vendorBills._count,
                        vendorBillsTotal: Number(vendorBills._sum.total || 0),
                        customerInvoicesCount: customerInvoices._count,
                        customerInvoicesTotal: Number(customerInvoices._sum.total || 0),
                        activeBudgets: budgets,
                        pendingAlerts: alerts,
                        pendingPayables: Number(pendingBills._sum.amountDue || 0),
                        pendingReceivables: Number(pendingInvoices._sum.amountDue || 0)
                    }
                }
            });
        } catch (error) { next(error); }
    },

    async getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const [recentPOs, recentSOs, recentBills, recentInvoices] = await Promise.all([
                prisma.purchaseOrder.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { vendor: { select: { name: true } } } }),
                prisma.salesOrder.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: { select: { name: true } } } }),
                prisma.vendorBill.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { vendor: { select: { name: true } } } }),
                prisma.customerInvoice.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: { select: { name: true } } } })
            ]);

            res.json({
                status: 'success',
                data: {
                    activity: {
                        purchaseOrders: recentPOs.map(po => ({ id: po.id, number: po.poNumber, vendor: po.vendor.name, total: Number(po.total), status: po.status, date: po.createdAt })),
                        salesOrders: recentSOs.map(so => ({ id: so.id, number: so.soNumber, customer: so.customer.name, total: Number(so.total), status: so.status, date: so.createdAt })),
                        vendorBills: recentBills.map(b => ({ id: b.id, number: b.billNumber, vendor: b.vendor.name, total: Number(b.total), status: b.status, date: b.createdAt })),
                        customerInvoices: recentInvoices.map(i => ({ id: i.id, number: i.invoiceNumber, customer: i.customer.name, total: Number(i.total), status: i.status, date: i.createdAt }))
                    }
                }
            });
        } catch (error) { next(error); }
    }
};

export default dashboardController;
