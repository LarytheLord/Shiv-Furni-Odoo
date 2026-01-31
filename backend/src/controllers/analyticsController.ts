import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get Budget vs Actuals Analysis
 * Compares planned budget amounts against actual expenses (vendor bills) and income (customer invoices)
 */
export const getBudgetVsActuals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get all confirmed/validated budgets with their lines and analytical accounts
        const budgets = await prisma.budget.findMany({
            where: {
                status: { in: ['CONFIRMED', 'VALIDATED', 'DONE'] }
            },
            include: {
                budgetLines: {
                    include: {
                        analyticalAccount: true
                    }
                }
            }
        });

        const report: any[] = [];

        for (const budget of budgets) {
            for (const line of budget.budgetLines) {
                // Calculate actual expenses from VendorBillLines
                const expenseResult = await prisma.vendorBillLine.aggregate({
                    where: {
                        analyticalAccountId: line.analyticalAccountId,
                        vendorBill: {
                            billDate: {
                                gte: budget.dateFrom,
                                lte: budget.dateTo
                            },
                            status: { in: ['CONFIRMED', 'PAID', 'PARTIALLY_PAID'] }
                        }
                    },
                    _sum: {
                        subtotal: true
                    }
                });

                const actualExpense = Number(expenseResult._sum.subtotal || 0);

                // Calculate actual income from CustomerInvoiceLines
                const incomeResult = await prisma.customerInvoiceLine.aggregate({
                    where: {
                        analyticalAccountId: line.analyticalAccountId,
                        customerInvoice: {
                            invoiceDate: {
                                gte: budget.dateFrom,
                                lte: budget.dateTo
                            },
                            status: { in: ['CONFIRMED', 'PAID', 'PARTIALLY_PAID'] }
                        }
                    },
                    _sum: {
                        subtotal: true
                    }
                });

                const actualIncome = Number(incomeResult._sum.subtotal || 0);
                const budgetAmount = Number(line.plannedAmount);

                report.push({
                    budget_id: budget.id,
                    budget_name: budget.name,
                    budget_line_id: line.id,
                    analytical_account: line.analyticalAccount.name,
                    analytical_account_code: line.analyticalAccount.code,
                    start_date: budget.dateFrom,
                    end_date: budget.dateTo,
                    budget_amount: budgetAmount,
                    actual_expense: actualExpense,
                    actual_income: actualIncome,
                    variance_expense: budgetAmount - actualExpense,
                    achievement_expense_pct: budgetAmount > 0
                        ? (actualExpense / budgetAmount) * 100
                        : 0
                });
            }
        }

        res.json(report);
    } catch (error) {
        next(error);
    }
};

/**
 * Get summary statistics for the dashboard
 */
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            totalContacts,
            totalProducts,
            totalBudgets,
            totalPurchaseOrders,
            totalSalesOrders,
            pendingBills,
            pendingInvoices
        ] = await Promise.all([
            prisma.contact.count({ where: { isActive: true } }),
            prisma.product.count({ where: { isActive: true } }),
            prisma.budget.count(),
            prisma.purchaseOrder.count(),
            prisma.salesOrder.count(),
            prisma.vendorBill.count({ where: { status: { in: ['DRAFT', 'CONFIRMED', 'PARTIALLY_PAID'] } } }),
            prisma.customerInvoice.count({ where: { status: { in: ['DRAFT', 'CONFIRMED', 'PARTIALLY_PAID'] } } })
        ]);

        // Calculate total revenue (paid invoices)
        const revenueResult = await prisma.customerInvoice.aggregate({
            where: { status: 'PAID' },
            _sum: { total: true }
        });

        // Calculate total expenses (paid bills)
        const expenseResult = await prisma.vendorBill.aggregate({
            where: { status: 'PAID' },
            _sum: { total: true }
        });

        res.json({
            totalContacts,
            totalProducts,
            totalBudgets,
            totalPurchaseOrders,
            totalSalesOrders,
            pendingBills,
            pendingInvoices,
            totalRevenue: Number(revenueResult._sum.total || 0),
            totalExpenses: Number(expenseResult._sum.total || 0),
            netProfit: Number(revenueResult._sum.total || 0) - Number(expenseResult._sum.total || 0)
        });
    } catch (error) {
        next(error);
    }
};
