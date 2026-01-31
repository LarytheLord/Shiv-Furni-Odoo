import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

// Helper to generate payment number
const generatePaymentNumber = async (prefix: string): Promise<string> => {
    const today = new Date();
    const fullPrefix = `${prefix}${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastPayment = await prisma.billPayment.findFirst({
        where: { paymentNumber: { startsWith: fullPrefix } },
        orderBy: { paymentNumber: 'desc' }
    });

    const sequence = lastPayment
        ? parseInt(lastPayment.paymentNumber.slice(-4)) + 1
        : 1;

    return `${fullPrefix}${String(sequence).padStart(4, '0')}`;
};

export const billPaymentController = {
    /**
     * Get all bill payments
     * GET /api/bill-payments
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, vendorBillId, paymentMethod } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (vendorBillId) {
                where.vendorBillId = String(vendorBillId);
            }

            if (paymentMethod) {
                where.paymentMethod = String(paymentMethod);
            }

            const [payments, total] = await Promise.all([
                prisma.billPayment.findMany({
                    where,
                    include: {
                        vendorBill: {
                            include: {
                                vendor: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { paymentDate: 'desc' }
                }),
                prisma.billPayment.count({ where })
            ]);

            res.status(200).json({
                status: 'success',
                data: { payments },
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
     * Get payment by ID
     * GET /api/bill-payments/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const payment = await prisma.billPayment.findUnique({
                where: { id },
                include: {
                    vendorBill: {
                        include: { vendor: true }
                    }
                }
            });

            if (!payment) {
                throw new ApiError('Payment not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { payment }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create bill payment
     * POST /api/bill-payments
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { vendorBillId, paymentDate, amount, paymentMethod, reference, notes } = req.body;

            // Get vendor bill
            const bill = await prisma.vendorBill.findUnique({
                where: { id: vendorBillId }
            });

            if (!bill) {
                throw new ApiError('Vendor bill not found', 404);
            }

            if (bill.status === 'PAID') {
                throw new ApiError('Bill is already fully paid', 400);
            }

            if (amount > Number(bill.amountDue)) {
                throw new ApiError(`Payment amount exceeds amount due (${bill.amountDue})`, 400);
            }

            const paymentNumber = await generatePaymentNumber('BP');

            const payment = await prisma.billPayment.create({
                data: {
                    paymentNumber,
                    vendorBillId,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    amount,
                    paymentMethod: paymentMethod || 'BANK_TRANSFER',
                    reference,
                    notes
                },
                include: {
                    vendorBill: {
                        include: { vendor: true }
                    }
                }
            });

            // Update bill amounts
            const newAmountPaid = Number(bill.amountPaid) + amount;
            const newAmountDue = Number(bill.total) - newAmountPaid;
            const newStatus = newAmountDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';

            await prisma.vendorBill.update({
                where: { id: vendorBillId },
                data: {
                    amountPaid: newAmountPaid,
                    amountDue: newAmountDue,
                    status: newStatus
                }
            });

            res.status(201).json({
                status: 'success',
                message: 'Payment recorded successfully',
                data: { payment }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete payment
     * DELETE /api/bill-payments/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const payment = await prisma.billPayment.findUnique({
                where: { id },
                include: { vendorBill: true }
            });

            if (!payment) {
                throw new ApiError('Payment not found', 404);
            }

            // Reverse the payment on the bill
            const bill = payment.vendorBill;
            const newAmountPaid = Number(bill.amountPaid) - Number(payment.amount);
            const newAmountDue = Number(bill.total) - newAmountPaid;
            const newStatus = newAmountPaid <= 0 ? 'CONFIRMED' : 'PARTIALLY_PAID';

            await prisma.$transaction([
                prisma.billPayment.delete({ where: { id } }),
                prisma.vendorBill.update({
                    where: { id: bill.id },
                    data: {
                        amountPaid: newAmountPaid,
                        amountDue: newAmountDue,
                        status: newStatus
                    }
                })
            ]);

            res.status(200).json({
                status: 'success',
                message: 'Payment deleted and bill updated'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get payments for a bill
     * GET /api/vendor-bills/:billId/payments
     */
    async getByBill(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { billId } = req.params;

            const payments = await prisma.billPayment.findMany({
                where: { vendorBillId: billId },
                orderBy: { paymentDate: 'desc' }
            });

            res.status(200).json({
                status: 'success',
                data: { payments }
            });
        } catch (error) {
            next(error);
        }
    }
};

export default billPaymentController;
