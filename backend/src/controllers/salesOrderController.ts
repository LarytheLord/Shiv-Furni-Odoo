import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
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

// Helper to find active budget for a given date
const findActiveBudgetForDate = async (date: Date) => {
    return prisma.budget.findFirst({
        where: {
            status: { in: ['CONFIRMED', 'VALIDATED'] },
            dateFrom: { lte: date },
            dateTo: { gte: date },
        },
        include: {
            budgetLines: {
                include: {
                    analyticalAccount: true,
                },
            },
        },
    });
};

// Helper to update budget line achieved amount for INCOME
const updateBudgetLineIncome = async (
    analyticalAccountId: string,
    amount: number,
    budgetId: string,
) => {
    console.log(`[SO Budget] Looking for INCOME budget line: budgetId=${budgetId}, analyticsId=${analyticalAccountId}, amount=${amount}`);
    
    // Find the INCOME budget line for this analytical account
    const budgetLine = await prisma.budgetLine.findFirst({
        where: {
            budgetId: budgetId,
            analyticalAccountId: analyticalAccountId,
            type: 'INCOME',
        },
    });

    console.log(`[SO Budget] Budget line found: ${budgetLine ? budgetLine.id : 'null'}`);

    if (budgetLine) {
        const currentAchieved = Number(budgetLine.achievedAmount) || 0;
        const incrementAmount = Number(amount) || 0;
        const newAchieved = currentAchieved + incrementAmount;
        
        console.log(`[SO Budget] Current achieved: ${currentAchieved}, increment: ${incrementAmount}, new total: ${newAchieved}`);
        
        // Use direct set instead of increment to ensure it works
        await prisma.budgetLine.update({
            where: { id: budgetLine.id },
            data: {
                achievedAmount: newAchieved,
            },
        });
        console.log(`[SO Budget] Successfully updated achievedAmount to ${newAchieved}`);
        return true;
    }
    console.log(`[SO Budget] No INCOME budget line found for analyticalAccountId: ${analyticalAccountId}`);
    return false;
};

export const salesOrderController = {
    /**
     * Get all sales orders
     * GET /api/sales-orders
     */
    async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

            if (req.user?.role === 'PORTAL_USER') {
                if (!req.user.contactId) {
                    throw new ApiError('Portal user has no linked contact', 400);
                }
                where.customerId = req.user.contactId;
            } else if (customerId) {
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
    async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

            // Guardrail: Portal User check
            if (req.user?.role === 'PORTAL_USER' && order.customerId !== req.user.contactId) {
                throw new ApiError('Unauthorized access to this resource', 403);
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

            const soDate = orderDate ? new Date(orderDate) : new Date();
            const soNumber = await generateSONumber();

            // Find active budget for the SO date (optional - not blocking like PO)
            const activeBudget = await findActiveBudgetForDate(soDate);

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
                    orderDate: soDate,
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

            // Update budget line income for each line with an analytical account
            let budgetUpdated = false;
            if (activeBudget) {
                console.log(`[SO Budget] Found active budget: ${activeBudget.id} (${activeBudget.name})`);
                console.log(`[SO Budget] Budget has ${activeBudget.budgetLines.length} lines`);
                
                for (const line of processedLines) {
                    // Check for truthy AND non-empty string
                    if (line.analyticalAccountId && line.analyticalAccountId.trim() !== '') {
                        console.log(`[SO Budget] Updating INCOME for analytics: ${line.analyticalAccountId}, amount: ${line.total}`);
                        const updated = await updateBudgetLineIncome(
                            line.analyticalAccountId,
                            line.total,
                            activeBudget.id,
                        );
                        console.log(`[SO Budget] Update result: ${updated}`);
                        if (updated) budgetUpdated = true;
                    } else {
                        console.log(`[SO Budget] Line has no analyticalAccountId, skipping`);
                    }
                }
            } else {
                console.log(`[SO Budget] No active budget found for date: ${soDate.toISOString()}`);
            }

            res.status(201).json({
                status: 'success',
                message: 'Sales order created successfully',
                data: { order, budgetUpdated }
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

            // Get the existing order first
            const existingOrder = await prisma.salesOrder.findUnique({
                where: { id },
                include: { lines: true }
            });

            if (!existingOrder) {
                throw new ApiError('Sales order not found', 404);
            }

            if (existingOrder.status !== 'DRAFT') {
                throw new ApiError('Only draft orders can be confirmed', 400);
            }

            // Update status to confirmed
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

            if (order.status !== 'CONFIRMED') {
                throw new ApiError('Only confirmed orders can be converted to invoices', 400);
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
