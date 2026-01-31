import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../config/database';

export const portalController = {
    /**
     * Get Aggregated Stats for Portal Dashboard
     * GET /api/portal/stats
     */
    async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const contactId = req.user?.contactId;
            if (!contactId) {
                res.status(200).json({ status: 'success', data: { stats: {} } });
                return;
            }

            // Fetch metrics in parallel
            const [
                activeOrdersCount,
                pendingInvoicesCount,
                pendingInvoicesAmount,
                totalSpent
            ] = await Promise.all([
                // Active Orders (Not Cancelled, Not Done - Simplified for dashboard)
                prisma.salesOrder.count({
                    where: { customerId: contactId, status: { notIn: ['CANCELLED', 'INVOICED'] } }
                }),
                // Pending Invoices
                prisma.customerInvoice.count({
                    where: { customerId: contactId, status: 'CONFIRMED', amountDue: { gt: 0 } }
                }),
                // Pending Amount
                prisma.customerInvoice.aggregate({
                    where: { customerId: contactId, status: 'CONFIRMED' },
                    _sum: { amountDue: true }
                }),
                // Total Spent (Paid Invoices)
                prisma.customerInvoice.aggregate({
                    where: { customerId: contactId, status: 'PAID' },
                    _sum: { total: true }
                })
            ]);

            // Vendor Specific Stats
            const [
                pendingBillsCount,
                pendingBillsAmount,
                activePOCount
            ] = await Promise.all([
                prisma.vendorBill.count({
                    where: { vendorId: contactId, status: 'CONFIRMED', amountDue: { gt: 0 } }
                }),
                prisma.vendorBill.aggregate({
                    where: { vendorId: contactId, status: 'CONFIRMED' },
                    _sum: { amountDue: true }
                }),
                prisma.purchaseOrder.count({
                    where: { vendorId: contactId, status: { notIn: ['CANCELLED', 'BILLED'] } }
                })
            ]);

            const customerStats = [
                { title: 'Active Orders', value: activeOrdersCount, icon: 'Package', trend: 'Processing' },
                { title: 'Pending Invoices', value: pendingInvoicesCount, icon: 'FileText', color: '#f59e0b' },
                { title: 'Amount Due', value: Number(pendingInvoicesAmount._sum.amountDue || 0), isCurrency: true, color: '#ef4444' },
                { title: 'Total Spent', value: Number(totalSpent._sum.total || 0), isCurrency: true, color: '#10b981' }
            ];

            const vendorStats = [
                { title: 'Active POs', value: activePOCount, icon: 'ShoppingCart', trend: 'Fulfillment' },
                { title: 'Pending Bills', value: pendingBillsCount, icon: 'FileText', color: '#f59e0b' },
                { title: 'Receivables', value: Number(pendingBillsAmount._sum.amountDue || 0), isCurrency: true, color: '#ef4444' }
            ];

            res.status(200).json({
                status: 'success',
                data: {
                    customerStats,
                    vendorStats,
                    // Return raw values too if frontend needs custom logic
                    raw: {
                        activeOrdersCount, pendingInvoicesAmount: Number(pendingInvoicesAmount._sum.amountDue || 0)
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }
};

export default portalController;
