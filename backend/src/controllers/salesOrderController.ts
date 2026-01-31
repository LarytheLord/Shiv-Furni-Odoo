import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { autoAnalyticalService } from '../services/autoAnalyticalService';
import { ApiError } from '../middleware/errorHandler';

// Helper to calculate line totals
const calculateLineTotals = (quantity: number, unitPrice: number, taxRate: number) => {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
};

// Helper to generate SO number
const generateSONumber = async (): Promise<string> => {
    const today = new Date();
    const prefix = `SO${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastSO = await prisma.salesOrder.findFirst({
        where: { soNumber: { startsWith: prefix } },
        orderBy: { soNumber: 'desc' }
    });

    const sequence = lastSO
        ? parseInt(lastSO.soNumber.slice(-4)) + 1
        : 1;

    return `${prefix}${String(sequence).padStart(4, '0')}`;
};

export const salesOrderController = {
    /**
     * Get all sales orders
     * GET /api/sales-orders
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, search, status, customerId } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (search) {
                where.OR = [
                    { soNumber: { contains: String(search), mode: 'insensitive' } },
                    { customer: { name: { contains: String(search), mode: 'insensitive' } } }
                ];
            }

            if (status) {
                where.status = String(status);
            }

            if (customerId) {
                where.customerId = String(customerId);
            }

            const [orders, total] = await Promise.all([
                prisma.salesOrder.findMany({
                    where,
                    include: {
                        customer: {
                            select: { id: true, name: true }
                        },
                        _count: {
                            select: { lines: true, customerInvoices: true }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.salesOrder.count({ where })
            ]);

            res.status(200).json({
                status: 'success',
                data: { orders },
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
     * Get sales order by ID
     * GET /api/sales-orders/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const order = await prisma.salesOrder.findUnique({
                where: { id },
                include: {
                    customer: true,
                    lines: {
                        include: {
                            product: true,
                            analyticalAccount: true
                        }
                    },
                    customerInvoices: {
                        select: { id: true, invoiceNumber: true, status: true, total: true }
                    }
                }
            });

            if (!order) {
                throw new ApiError('Sales order not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create sales order
     * POST /api/sales-orders
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { customerId, orderDate, notes, lines } = req.body;

            const soNumber = await generateSONumber();

            // Process lines with auto-analytical
            const processedLines = await Promise.all(
                lines.map(async (line: any) => {
                    const totals = calculateLineTotals(line.quantity, line.unitPrice, line.taxRate || 0);

                    let analyticalAccountId = line.analyticalAccountId;
                    let isAutoAssigned = false;

                    if (!analyticalAccountId) {
                        const match = await autoAnalyticalService.findMatchingRule({
                            productId: line.productId,
                            contactId: customerId,
                            amount: totals.total,
                            type: 'SALE'
                        });
                        analyticalAccountId = match.analyticalAccountId;
                        isAutoAssigned = match.isAutoAssigned;
                    }

                    return {
                        productId: line.productId,
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        taxRate: line.taxRate || 0,
                        ...totals,
                        analyticalAccountId,
                        isAutoAssigned
                    };
                })
            );

            // Calculate order totals
            const orderTotals = processedLines.reduce(
                (acc, line) => ({
                    subtotal: acc.subtotal + line.subtotal,
                    taxAmount: acc.taxAmount + line.taxAmount,
                    total: acc.total + line.total
                }),
                { subtotal: 0, taxAmount: 0, total: 0 }
            );

            const order = await prisma.salesOrder.create({
                data: {
                    soNumber,
                    customerId,
                    orderDate: orderDate ? new Date(orderDate) : new Date(),
                    notes,
                    ...orderTotals,
                    lines: {
                        create: processedLines
                    }
                },
                include: {
                    customer: true,
                    lines: {
                        include: {
                            product: true,
                            analyticalAccount: true
                        }
                    }
                }
            });

            res.status(201).json({
                status: 'success',
                message: 'Sales order created successfully',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update sales order
     * PATCH /api/sales-orders/:id
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { customerId, orderDate, notes, status } = req.body;

            const order = await prisma.salesOrder.update({
                where: { id },
                data: {
                    ...(customerId && { customerId }),
                    ...(orderDate && { orderDate: new Date(orderDate) }),
                    ...(notes !== undefined && { notes }),
                    ...(status && { status })
                },
                include: {
                    customer: true,
                    lines: {
                        include: { product: true, analyticalAccount: true }
                    }
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Sales order updated successfully',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete sales order
     * DELETE /api/sales-orders/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const order = await prisma.salesOrder.findUnique({
                where: { id },
                include: { customerInvoices: true }
            });

            if (!order) {
                throw new ApiError('Sales order not found', 404);
            }

            if (order.customerInvoices.length > 0) {
                throw new ApiError('Cannot delete order with associated invoices', 400);
            }

            if (order.status !== 'DRAFT') {
                throw new ApiError('Only draft orders can be deleted', 400);
            }

            await prisma.salesOrder.delete({ where: { id } });

            res.status(200).json({
                status: 'success',
                message: 'Sales order deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Confirm sales order
     * POST /api/sales-orders/:id/confirm
     */
    async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const order = await prisma.salesOrder.update({
                where: { id },
                data: { status: 'CONFIRMED' }
            });

            res.status(200).json({
                status: 'success',
                message: 'Sales order confirmed',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Convert to customer invoice
     * POST /api/sales-orders/:id/create-invoice
     */
    async createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { dueDate } = req.body;

            const order = await prisma.salesOrder.findUnique({
                where: { id },
                include: { lines: true }
            });

            if (!order) {
                throw new ApiError('Sales order not found', 404);
            }

            // Generate invoice number
            const today = new Date();
            const prefix = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

            const lastInvoice = await prisma.customerInvoice.findFirst({
                where: { invoiceNumber: { startsWith: prefix } },
                orderBy: { invoiceNumber: 'desc' }
            });

            const sequence = lastInvoice
                ? parseInt(lastInvoice.invoiceNumber.slice(-4)) + 1
                : 1;

            const invoiceNumber = `${prefix}${String(sequence).padStart(4, '0')}`;

            const invoice = await prisma.customerInvoice.create({
                data: {
                    invoiceNumber,
                    salesOrderId: id,
                    customerId: order.customerId,
                    dueDate: new Date(dueDate),
                    subtotal: order.subtotal,
                    taxAmount: order.taxAmount,
                    total: order.total,
                    amountDue: order.total,
                    lines: {
                        create: order.lines.map(line => ({
                            productId: line.productId,
                            description: line.description,
                            quantity: line.quantity,
                            unitPrice: line.unitPrice,
                            taxRate: line.taxRate,
                            subtotal: line.subtotal,
                            taxAmount: line.taxAmount,
                            total: line.total,
                            analyticalAccountId: line.analyticalAccountId,
                            isAutoAssigned: line.isAutoAssigned
                        }))
                    }
                },
                include: {
                    customer: true,
                    lines: {
                        include: { product: true, analyticalAccount: true }
                    }
                }
            });

            // Update SO status
            await prisma.salesOrder.update({
                where: { id },
                data: { status: 'INVOICED' }
            });

            res.status(201).json({
                status: 'success',
                message: 'Customer invoice created from sales order',
                data: { invoice }
            });
        } catch (error) {
            next(error);
        }
    }
};

export default salesOrderController;
