import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { ContactType } from '@prisma/client';

export const contactController = {
  /**
   * Get all contacts
   * GET /api/contacts
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, search, type, isActive } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { phone: { contains: String(search), mode: 'insensitive' } },
          { city: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (type) {
        where.type = String(type) as ContactType;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { name: 'asc' },
          include: {
            tags: true,
          },
        }),
        prisma.contact.count({ where }),
      ]);

      res.status(200).json({
        status: 'success',
        data: { contacts },
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

  /**
   * Get all contact tags
   * GET /api/contacts/tags
   */
  async getTags(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const tags = await prisma.contactTag.findMany({
        orderBy: { name: 'asc' },
      });

      res.status(200).json({
        status: 'success',
        data: { tags },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get vendors only
   * GET /api/contacts/vendors
   */
  async getVendors(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const vendors = await prisma.contact.findMany({
        where: {
          type: { in: ['VENDOR', 'BOTH'] },
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      res.status(200).json({
        status: 'success',
        data: { vendors },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get customers only
   * GET /api/contacts/customers
   */
  async getCustomers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const customers = await prisma.contact.findMany({
        where: {
          type: { in: ['CUSTOMER', 'BOTH'] },
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      res.status(200).json({
        status: 'success',
        data: { customers },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get contact by ID
   * GET /api/contacts/:id
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const contact = await prisma.contact.findUnique({
        where: { id },
        include: {
          tags: true,
          purchaseOrders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              poNumber: true,
              total: true,
              status: true,
              orderDate: true,
            },
          },
          vendorBills: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              billNumber: true,
              total: true,
              status: true,
              billDate: true,
            },
          },
          salesOrders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              soNumber: true,
              total: true,
              status: true,
              orderDate: true,
            },
          },
          customerInvoices: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              invoiceNumber: true,
              total: true,
              status: true,
              invoiceDate: true,
            },
          },
        },
      });

      if (!contact) {
        throw new ApiError('Contact not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { contact },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create contact
   * POST /api/contacts
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        email,
        phone,
        street,
        city,
        state,
        country,
        pincode,
        image,
        tags,
        type,
      } = req.body;

      // Process tags - create if they don't exist
      let tagConnections: {
        where: { name: string };
        create: { name: string };
      }[] = [];
      if (tags && Array.isArray(tags) && tags.length > 0) {
        tagConnections = tags.map((tagName: string) => ({
          where: { name: tagName },
          create: { name: tagName },
        }));
      }

      const contact = await prisma.contact.create({
        data: {
          name,
          email: email || null,
          phone,
          street,
          city,
          state,
          country,
          pincode,
          image,
          type: type || 'CUSTOMER',
          ...(tagConnections.length > 0 && {
            tags: {
              connectOrCreate: tagConnections,
            },
          }),
        },
        include: {
          tags: true,
        },
      });

      res.status(201).json({
        status: 'success',
        message: 'Contact created successfully',
        data: { contact },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update contact
   * PATCH /api/contacts/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        phone,
        street,
        city,
        state,
        country,
        pincode,
        image,
        tags,
        type,
        isActive,
      } = req.body;

      // Process tags - create if they don't exist
      let tagsUpdate: any = undefined;
      if (tags !== undefined && Array.isArray(tags)) {
        const tagConnections = tags.map((tagName: string) => ({
          where: { name: tagName },
          create: { name: tagName },
        }));
        tagsUpdate = {
          set: [], // Disconnect all existing tags
          connectOrCreate: tagConnections,
        };
      }

      const contact = await prisma.contact.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email !== undefined && { email: email || null }),
          ...(phone !== undefined && { phone }),
          ...(street !== undefined && { street }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(country !== undefined && { country }),
          ...(pincode !== undefined && { pincode }),
          ...(image !== undefined && { image }),
          ...(type && { type }),
          ...(typeof isActive === 'boolean' && { isActive }),
          ...(tagsUpdate && { tags: tagsUpdate }),
        },
        include: {
          tags: true,
        },
      });

      res.status(200).json({
        status: 'success',
        message: 'Contact updated successfully',
        data: { contact },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete contact
   * DELETE /api/contacts/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Check for related records
      const [purchaseOrders, vendorBills, salesOrders, customerInvoices] =
        await Promise.all([
          prisma.purchaseOrder.count({ where: { vendorId: id } }),
          prisma.vendorBill.count({ where: { vendorId: id } }),
          prisma.salesOrder.count({ where: { customerId: id } }),
          prisma.customerInvoice.count({ where: { customerId: id } }),
        ]);

      if (
        purchaseOrders > 0 ||
        vendorBills > 0 ||
        salesOrders > 0 ||
        customerInvoices > 0
      ) {
        // Soft delete - just mark as inactive
        await prisma.contact.update({
          where: { id },
          data: { isActive: false },
        });

        res.status(200).json({
          status: 'success',
          message: 'Contact deactivated (has related records)',
        });
        return;
      }

      await prisma.contact.delete({
        where: { id },
      });

      res.status(200).json({
        status: 'success',
        message: 'Contact deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get contact statistics
   * GET /api/contacts/:id/stats
   */
  async getStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const contact = await prisma.contact.findUnique({ where: { id } });
      if (!contact) {
        throw new ApiError('Contact not found', 404);
      }

      const [
        totalPurchases,
        totalPurchaseAmount,
        totalSales,
        totalSalesAmount,
        pendingBills,
        pendingInvoices,
      ] = await Promise.all([
        prisma.purchaseOrder.count({ where: { vendorId: id } }),
        prisma.vendorBill.aggregate({
          where: {
            vendorId: id,
            status: { in: ['CONFIRMED', 'PAID', 'PARTIALLY_PAID'] },
          },
          _sum: { total: true },
        }),
        prisma.salesOrder.count({ where: { customerId: id } }),
        prisma.customerInvoice.aggregate({
          where: {
            customerId: id,
            status: { in: ['CONFIRMED', 'PAID', 'PARTIALLY_PAID'] },
          },
          _sum: { total: true },
        }),
        prisma.vendorBill.aggregate({
          where: {
            vendorId: id,
            status: { in: ['CONFIRMED', 'PARTIALLY_PAID'] },
          },
          _sum: { amountDue: true },
        }),
        prisma.customerInvoice.aggregate({
          where: {
            customerId: id,
            status: { in: ['CONFIRMED', 'PARTIALLY_PAID'] },
          },
          _sum: { amountDue: true },
        }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalPurchases,
            totalPurchaseAmount: Number(totalPurchaseAmount._sum.total || 0),
            totalSales,
            totalSalesAmount: Number(totalSalesAmount._sum.total || 0),
            pendingBillsAmount: Number(pendingBills._sum.amountDue || 0),
            pendingInvoicesAmount: Number(pendingInvoices._sum.amountDue || 0),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default contactController;
