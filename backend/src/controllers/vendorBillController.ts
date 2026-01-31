import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { autoAnalyticalService } from '../services/autoAnalyticalService';
import { alertService } from '../services/alertService';
import { pdfService } from '../services/pdfService';
import { ApiError } from '../middleware/errorHandler';

// Helper to calculate line totals
const calculateLineTotals = (quantity: number, unitPrice: number, taxRate: number) => {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
};

// Helper to generate bill number
const generateBillNumber = async (): Promise<string> => {
    const today = new Date();
    const prefix = `BILL${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastBill = await prisma.vendorBill.findFirst({
        where: { billNumber: { startsWith: prefix } },
        orderBy: { billNumber: 'desc' }
    });

    const sequence = lastBill
        ? parseInt(lastBill.billNumber.slice(-4)) + 1
        : 1;

    return `${prefix}${String(sequence).padStart(4, '0')}`;
};

export const vendorBillController = {
    /**
     * Get all vendor bills
     * GET /api/vendor-bills
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, search, status, vendorId } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (search) {
                where.OR = [
                    { billNumber: { contains: String(search), mode: 'insensitive' } },
                    { vendor: { name: { contains: String(search), mode: 'insensitive' } } }
                ];
            }

            if (status) {
                where.status = String(status);
            }

            if (vendorId) {
                where.vendorId = String(vendorId);
            }

            const [bills, total] = await Promise.all([
                prisma.vendorBill.findMany({
                    where,
                    include: {
                        vendor: {
                            select: { id: true, name: true }
                        },
                        purchaseOrder: {
                            select: { id: true, poNumber: true }
                        },
                        _count: {
                            select: { lines: true, payments: true }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.vendorBill.count({ where })
            ]);

            res.status(200).json({
                status: 'success',
                data: { bills },
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
     * Get vendor bill by ID
     * GET /api/vendor-bills/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const bill = await prisma.vendorBill.findUnique({
                where: { id },
                include: {
                    vendor: true,
                    purchaseOrder: {
                        select: { id: true, poNumber: true }
                    },
                    lines: {
                        include: {
                            product: true,
                            analyticalAccount: true
                        }
                    },
                    payments: true
                }
            });

            if (!bill) {
                throw new ApiError('Vendor bill not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { bill }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create vendor bill
     * POST /api/vendor-bills
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { vendorId, purchaseOrderId, billDate, dueDate, notes, lines } = req.body;

            const billNumber = await generateBillNumber();

            // Process lines with auto-analytical
            const processedLines = await Promise.all(
                lines.map(async (line: any) => {
                    const totals = calculateLineTotals(line.quantity, line.unitPrice, line.taxRate || 0);

                    let analyticalAccountId = line.analyticalAccountId;
                    let isAutoAssigned = false;

                    if (!analyticalAccountId) {
                        const match = await autoAnalyticalService.findMatchingRule({
                            productId: line.productId,
                            contactId: vendorId,
                            amount: totals.total,
                            type: 'PURCHASE'
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

            // Calculate bill totals
            const billTotals = processedLines.reduce(
                (acc, line) => ({
                    subtotal: acc.subtotal + line.subtotal,
                    taxAmount: acc.taxAmount + line.taxAmount,
                    total: acc.total + line.total
                }),
                { subtotal: 0, taxAmount: 0, total: 0 }
            );

            const bill = await prisma.vendorBill.create({
                data: {
                    billNumber,
                    vendorId,
                    purchaseOrderId,
                    billDate: billDate ? new Date(billDate) : new Date(),
                    dueDate: new Date(dueDate),
                    notes,
                    ...billTotals,
                    amountDue: billTotals.total,
                    lines: {
                        create: processedLines
                    }
                },
                include: {
                    vendor: true,
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
                message: 'Vendor bill created successfully',
                data: { bill }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update vendor bill
     * PATCH /api/vendor-bills/:id
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { vendorId, billDate, dueDate, notes, status } = req.body;

            const bill = await prisma.vendorBill.update({
                where: { id },
                data: {
                    ...(vendorId && { vendorId }),
                    ...(billDate && { billDate: new Date(billDate) }),
                    ...(dueDate && { dueDate: new Date(dueDate) }),
                    ...(notes !== undefined && { notes }),
                    ...(status && { status })
                },
                include: {
                    vendor: true,
                    lines: {
                        include: { product: true, analyticalAccount: true }
                    }
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Vendor bill updated successfully',
                data: { bill }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete vendor bill
     * DELETE /api/vendor-bills/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const bill = await prisma.vendorBill.findUnique({
                where: { id },
                include: { payments: true }
            });

            if (!bill) {
                throw new ApiError('Vendor bill not found', 404);
            }

            if (bill.payments.length > 0) {
                throw new ApiError('Cannot delete bill with associated payments', 400);
            }

            if (bill.status !== 'DRAFT') {
                throw new ApiError('Only draft bills can be deleted', 400);
            }

            await prisma.vendorBill.delete({ where: { id } });

            res.status(200).json({
                status: 'success',
                message: 'Vendor bill deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Confirm vendor bill
     * POST /api/vendor-bills/:id/confirm
     */
    async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const bill = await prisma.vendorBill.update({
                where: { id },
                data: { status: 'CONFIRMED' },
                include: {
                    lines: {
                        include: { analyticalAccount: true }
                    }
                }
            });

            // Process budget alerts for each line
            await alertService.processAllBudgets();

            res.status(200).json({
                status: 'success',
                message: 'Vendor bill confirmed',
                data: { bill }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Generate PDF
     * GET /api/vendor-bills/:id/pdf
     */
    async generatePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const bill = await prisma.vendorBill.findUnique({
                where: { id },
                include: {
                    vendor: true,
                    lines: {
                        include: { product: true }
                    }
                }
            });

            if (!bill) {
                throw new ApiError('Vendor bill not found', 404);
            }

            const pdfBuffer = await pdfService.generateInvoicePdf({
                type: 'BILL',
                number: bill.billNumber,
                date: bill.billDate,
                dueDate: bill.dueDate,
                company: {
                    name: 'Shiv Furniture',
                    address: '123 Industrial Area, Furniture Market\nJaipur, Rajasthan 302001',
                    gstin: '08AABCS1234A1Z5',
                    phone: '+91 98765 43210',
                    email: 'accounts@shivfurniture.com'
                },
                party: {
                    name: bill.vendor.name,
                    address: bill.vendor.address || '',
                    gstin: bill.vendor.gstin || undefined,
                    phone: bill.vendor.phone || undefined,
                    email: bill.vendor.email || undefined
                },
                lines: bill.lines.map(line => ({
                    description: line.description || line.product.name,
                    quantity: Number(line.quantity),
                    unitPrice: Number(line.unitPrice),
                    taxRate: Number(line.taxRate),
                    subtotal: Number(line.subtotal),
                    taxAmount: Number(line.taxAmount),
                    total: Number(line.total)
                })),
                subtotal: Number(bill.subtotal),
                taxAmount: Number(bill.taxAmount),
                total: Number(bill.total),
                amountPaid: Number(bill.amountPaid),
                amountDue: Number(bill.amountDue),
                notes: bill.notes || undefined
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${bill.billNumber}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }
};

export default vendorBillController;
