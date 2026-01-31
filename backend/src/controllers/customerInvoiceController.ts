import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { autoAnalyticalService } from '../services/autoAnalyticalService';
import { pdfService } from '../services/pdfService';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';

const calculateLineTotals = (
  quantity: number,
  unitPrice: number,
  taxRate: number,
) => {
  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
};

const generateInvoiceNumber = async (): Promise<string> => {
  const today = new Date();
  const prefix = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  const lastInvoice = await prisma.customerInvoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
  });
  const sequence = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.slice(-4)) + 1
    : 1;
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

export const customerInvoiceController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, search, status, customerId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};
      if (search)
        where.OR = [
          { invoiceNumber: { contains: String(search), mode: 'insensitive' } },
        ];
      if (status) where.status = String(status);

      if (req.user?.role === 'PORTAL_USER') {
        if (!req.user.contactId) throw new ApiError('Portal user has no linked contact', 400);
        where.customerId = req.user.contactId;
      } else if (customerId) {
        where.customerId = String(customerId);
      }

      const [invoices, total] = await Promise.all([
        prisma.customerInvoice.findMany({
          where,
          include: {
            customer: { select: { id: true, name: true } },
            _count: { select: { lines: true, payments: true } },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.customerInvoice.count({ where }),
      ]);
      res.json({
        status: 'success',
        data: { invoices },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyInvoices(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const contactId = req.user!.contactId;
      if (!contactId) {
        res.json({ status: 'success', data: { invoices: [] } });
        return;
      }
      const invoices = await prisma.customerInvoice.findMany({
        where: { customerId: contactId },
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ status: 'success', data: { invoices } });
    } catch (error) {
      next(error);
    }
  },

  async getById(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const invoice = await prisma.customerInvoice.findUnique({
        where: { id: req.params.id },
        include: {
          customer: true,
          lines: { include: { product: true, analyticalAccount: true } },
          payments: true,
        },
      });
      if (!invoice) throw new ApiError('Invoice not found', 404);

      // Guardrail
      if (req.user?.role === 'PORTAL_USER' && invoice.customerId !== req.user.contactId) {
        throw new ApiError('Unauthorized access', 403);
      }
      res.json({ status: 'success', data: { invoice } });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, salesOrderId, invoiceDate, dueDate, notes, lines } =
        req.body;
      const invoiceNumber = await generateInvoiceNumber();

      const processedLines = await Promise.all(
        lines.map(async (line: any) => {
          const totals = calculateLineTotals(
            line.quantity,
            line.unitPrice,
            line.taxRate || 0,
          );
          let analyticalAccountId = line.analyticalAccountId,
            isAutoAssigned = false;
          if (!analyticalAccountId) {
            const match = await autoAnalyticalService.findMatchingRule({
              productId: line.productId,
              contactId: customerId,
              amount: totals.total,
              type: 'SALE',
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
            isAutoAssigned,
          };
        }),
      );

      const invoiceTotals = processedLines.reduce(
        (acc, l) => ({
          subtotal: acc.subtotal + l.subtotal,
          taxAmount: acc.taxAmount + l.taxAmount,
          total: acc.total + l.total,
        }),
        { subtotal: 0, taxAmount: 0, total: 0 },
      );

      const invoice = await prisma.customerInvoice.create({
        data: {
          invoiceNumber,
          customerId,
          salesOrderId,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          dueDate: new Date(dueDate),
          notes,
          ...invoiceTotals,
          amountDue: invoiceTotals.total,
          lines: { create: processedLines },
        },
        include: {
          customer: true,
          lines: { include: { product: true, analyticalAccount: true } },
        },
      });
      res
        .status(201)
        .json({
          status: 'success',
          message: 'Invoice created',
          data: { invoice },
        });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, invoiceDate, dueDate, notes, status } = req.body;
      const invoice = await prisma.customerInvoice.update({
        where: { id: req.params.id },
        data: {
          ...(customerId && { customerId }),
          ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(notes !== undefined && { notes }),
          ...(status && { status }),
        },
        include: { customer: true, lines: { include: { product: true } } },
      });
      res.json({
        status: 'success',
        message: 'Invoice updated',
        data: { invoice },
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await prisma.customerInvoice.findUnique({
        where: { id: req.params.id },
        include: { payments: true },
      });
      if (!invoice) throw new ApiError('Invoice not found', 404);
      if (invoice.payments.length > 0)
        throw new ApiError('Cannot delete invoice with payments', 400);
      if (invoice.status !== 'DRAFT')
        throw new ApiError('Only draft invoices can be deleted', 400);
      await prisma.customerInvoice.delete({ where: { id: req.params.id } });
      res.json({ status: 'success', message: 'Invoice deleted' });
    } catch (error) {
      next(error);
    }
  },

  async confirm(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const invoice = await prisma.customerInvoice.update({
        where: { id: req.params.id },
        data: { status: 'CONFIRMED' },
      });
      res.json({
        status: 'success',
        message: 'Invoice confirmed',
        data: { invoice },
      });
    } catch (error) {
      next(error);
    }
  },

  async generatePdf(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const invoice = await prisma.customerInvoice.findUnique({
        where: { id: req.params.id },
        include: { customer: true, lines: { include: { product: true } } },
      });
      if (!invoice) throw new ApiError('Invoice not found', 404);
      const pdfBuffer = await pdfService.generateInvoicePdf({
        type: 'INVOICE',
        number: invoice.invoiceNumber,
        date: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        company: {
          name: 'Shiv Furniture',
          address: '123 Industrial Area, Jaipur 302001',
          gstin: '08AABCS1234A1Z5',
          phone: '+91 98765 43210',
          email: 'sales@shivfurniture.com',
        },
        party: {
          name: invoice.customer.name,
          address:
            [
              invoice.customer.street,
              invoice.customer.city,
              invoice.customer.state,
              invoice.customer.country,
              invoice.customer.pincode,
            ]
              .filter(Boolean)
              .join(', ') || '',
        },
        lines: invoice.lines.map((l) => ({
          description: l.description || l.product.name,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          taxRate: Number(l.taxRate),
          subtotal: Number(l.subtotal),
          taxAmount: Number(l.taxAmount),
          total: Number(l.total),
        })),
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        total: Number(invoice.total),
        amountPaid: Number(invoice.amountPaid),
        amountDue: Number(invoice.amountDue),
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${invoice.invoiceNumber}.pdf`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  },
};

export default customerInvoiceController;
