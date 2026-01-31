import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

const generatePaymentNumber = async (): Promise<string> => {
    const today = new Date();
    const prefix = `PAY${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const lastPayment = await prisma.invoicePayment.findFirst({
        where: { paymentNumber: { startsWith: prefix } },
        orderBy: { paymentNumber: 'desc' }
    });
    const sequence = lastPayment ? parseInt(lastPayment.paymentNumber.slice(-4)) + 1 : 1;
    return `${prefix}${String(sequence).padStart(4, '0')}`;
};

export const invoicePaymentController = {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, customerInvoiceId, paymentMethod } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where: any = {};
            if (customerInvoiceId) where.customerInvoiceId = String(customerInvoiceId);
            if (paymentMethod) where.paymentMethod = String(paymentMethod);

            const [payments, total] = await Promise.all([
                prisma.invoicePayment.findMany({
                    where,
                    include: { customerInvoice: { include: { customer: { select: { id: true, name: true } } } } },
                    skip, take: Number(limit), orderBy: { paymentDate: 'desc' }
                }),
                prisma.invoicePayment.count({ where })
            ]);
            res.json({ status: 'success', data: { payments }, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
        } catch (error) { next(error); }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payment = await prisma.invoicePayment.findUnique({
                where: { id: req.params.id },
                include: { customerInvoice: { include: { customer: true } } }
            });
            if (!payment) throw new ApiError('Payment not found', 404);
            res.json({ status: 'success', data: { payment } });
        } catch (error) { next(error); }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { customerInvoiceId, paymentDate, amount, paymentMethod, reference, notes } = req.body;

            const invoice = await prisma.customerInvoice.findUnique({ where: { id: customerInvoiceId } });
            if (!invoice) throw new ApiError('Invoice not found', 404);
            if (invoice.status === 'PAID') throw new ApiError('Invoice already fully paid', 400);
            if (amount > Number(invoice.amountDue)) throw new ApiError(`Payment exceeds amount due (${invoice.amountDue})`, 400);

            const paymentNumber = await generatePaymentNumber();

            const payment = await prisma.invoicePayment.create({
                data: {
                    paymentNumber,
                    customerInvoiceId,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    amount,
                    paymentMethod: paymentMethod || 'BANK_TRANSFER',
                    reference,
                    notes
                },
                include: { customerInvoice: { include: { customer: true } } }
            });

            const newAmountPaid = Number(invoice.amountPaid) + amount;
            const newAmountDue = Number(invoice.total) - newAmountPaid;
            const newStatus = newAmountDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';

            await prisma.customerInvoice.update({
                where: { id: customerInvoiceId },
                data: { amountPaid: newAmountPaid, amountDue: newAmountDue, status: newStatus }
            });

            res.status(201).json({ status: 'success', message: 'Payment recorded', data: { payment } });
        } catch (error) { next(error); }
    },

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payment = await prisma.invoicePayment.findUnique({
                where: { id: req.params.id },
                include: { customerInvoice: true }
            });
            if (!payment) throw new ApiError('Payment not found', 404);

            const invoice = payment.customerInvoice;
            const newAmountPaid = Number(invoice.amountPaid) - Number(payment.amount);
            const newAmountDue = Number(invoice.total) - newAmountPaid;
            const newStatus = newAmountPaid <= 0 ? 'CONFIRMED' : 'PARTIALLY_PAID';

            await prisma.$transaction([
                prisma.invoicePayment.delete({ where: { id: req.params.id } }),
                prisma.customerInvoice.update({
                    where: { id: invoice.id },
                    data: { amountPaid: newAmountPaid, amountDue: newAmountDue, status: newStatus }
                })
            ]);

            res.json({ status: 'success', message: 'Payment deleted and invoice updated' });
        } catch (error) { next(error); }
    },

    async getByInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payments = await prisma.invoicePayment.findMany({
                where: { customerInvoiceId: req.params.invoiceId },
                orderBy: { paymentDate: 'desc' }
            });
            res.json({ status: 'success', data: { payments } });
        } catch (error) { next(error); }
    }
};

export default invoicePaymentController;
