import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../config/database';
import { autoAnalyticalService } from '../services/autoAnalyticalService';
import { ApiError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Helper to calculate line totals
const calculateLineTotals = (
  quantity: number,
  unitPrice: number,
  taxRate: number,
) => {
  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
};

// Helper to generate PO number
const generatePONumber = async (): Promise<string> => {
  const today = new Date();
  const prefix = `PO${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

  const lastPO = await prisma.purchaseOrder.findFirst({
    where: { poNumber: { startsWith: prefix } },
    orderBy: { poNumber: 'desc' },
  });

  const sequence = lastPO ? parseInt(lastPO.poNumber.slice(-4)) + 1 : 1;

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

// Helper to update budget line achieved amount
const updateBudgetLineExpense = async (
  analyticalAccountId: string,
  amount: number,
  budgetId: string,
) => {
  const budgetLine = await prisma.budgetLine.findFirst({
    where: {
      budgetId,
      analyticalAccountId,
      type: 'EXPENSE',
    },
  });

  if (budgetLine) {
    await prisma.budgetLine.update({
      where: { id: budgetLine.id },
      data: {
        achievedAmount: {
          increment: amount,
        },
      },
    });
  }
};

// Helper to validate budget limits for expense lines
interface BudgetValidationResult {
  isValid: boolean;
  errorType: 'EXCEEDED' | 'NO_BUDGET_LINE' | null;
  exceededErrors: Array<{
    analyticalAccountName: string;
    plannedAmount: number;
    currentSpent: number;
    newExpense: number;
    wouldExceedBy: number;
  }>;
  missingBudgetLines: string[]; // analytical account names without budget lines
}

const validateBudgetLimits = async (
  budget: any,
  expensesByAccount: Map<string, { amount: number; accountName: string }>,
): Promise<BudgetValidationResult> => {
  const exceededErrors: BudgetValidationResult['exceededErrors'] = [];
  const missingBudgetLines: string[] = [];

  for (const [
    analyticalAccountId,
    { amount: expenseAmount, accountName },
  ] of expensesByAccount) {
    // Find the budget line for this analytical account
    const budgetLine = budget.budgetLines.find(
      (line: any) =>
        line.analyticalAccountId === analyticalAccountId &&
        line.type === 'EXPENSE',
    );

    if (!budgetLine) {
      // No budget line exists for this analytical account
      missingBudgetLines.push(accountName);
    } else {
      const plannedAmount = Number(budgetLine.plannedAmount);
      const currentSpent = Number(budgetLine.achievedAmount);
      const newTotal = currentSpent + expenseAmount;

      if (newTotal > plannedAmount) {
        exceededErrors.push({
          analyticalAccountName: budgetLine.analyticalAccount.name,
          plannedAmount,
          currentSpent,
          newExpense: expenseAmount,
          wouldExceedBy: newTotal - plannedAmount,
        });
      }
    }
  }

  // Determine error type - prioritize missing budget lines
  let errorType: BudgetValidationResult['errorType'] = null;
  if (missingBudgetLines.length > 0) {
    errorType = 'NO_BUDGET_LINE';
  } else if (exceededErrors.length > 0) {
    errorType = 'EXCEEDED';
  }

  return {
    isValid: errorType === null,
    errorType,
    exceededErrors,
    missingBudgetLines,
  };
};

export const purchaseOrderController = {
    /**
     * Get all purchase orders
     * GET /api/purchase-orders
     */
    async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 20, search, status, vendorId } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { poNumber: { contains: String(search), mode: 'insensitive' } },
          {
            vendor: { name: { contains: String(search), mode: 'insensitive' } },
          },
        ];
      }

      if (status) {
        where.status = String(status);
      }

            if (req.user?.role === 'PORTAL_USER') {
                if (!req.user.contactId) {
                    throw new ApiError('Portal user has no linked contact', 400);
                }
                where.vendorId = req.user.contactId;
            } else if (vendorId) {
                where.vendorId = String(vendorId);
            }

      const [orders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          include: {
            vendor: {
              select: { id: true, name: true },
            },
            _count: {
              select: { lines: true, vendorBills: true },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.purchaseOrder.count({ where }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          orders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get purchase order by ID
   * GET /api/purchase-orders/:id
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
          vendor: true,
          lines: {
            include: {
              product: true,
              analyticalAccount: true,
            },
          },
          vendorBills: {
            select: { id: true, billNumber: true, status: true, total: true },
          },
        },
      });

      if (!order) {
        throw new ApiError('Purchase order not found', 404);
      }

            // Guardrail: Portal User check
            if (req.user?.role === 'PORTAL_USER' && order.vendorId !== req.user.contactId) {
                throw new ApiError('Unauthorized access to this resource', 403);
            }

      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create purchase order
   * POST /api/purchase-orders
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId, orderDate, notes, lines } = req.body;

      const poDate = orderDate ? new Date(orderDate) : new Date();

      // Check if an active budget exists for the PO date
      const activeBudget = await findActiveBudgetForDate(poDate);

      if (!activeBudget) {
        throw new ApiError(
          `No active budget found for the selected date (${poDate.toLocaleDateString()}). Please create a budget that covers this period before creating a purchase order.`,
          400,
          'NO_BUDGET_FOUND',
        );
      }

      const poNumber = await generatePONumber();

      // Process lines with auto-analytical
      const processedLines = await Promise.all(
        lines.map(async (line: any) => {
          const totals = calculateLineTotals(
            line.quantity,
            line.unitPrice,
            line.taxRate || 0,
          );

          let analyticalAccountId = line.analyticalAccountId;
          let isAutoAssigned = false;

          if (!analyticalAccountId) {
            const match = await autoAnalyticalService.findMatchingRule({
              productId: line.productId,
              contactId: vendorId,
              amount: totals.total,
              type: 'PURCHASE',
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

      // Calculate order totals
      const orderTotals = processedLines.reduce(
        (acc, line) => ({
          subtotal: acc.subtotal + line.subtotal,
          taxAmount: acc.taxAmount + line.taxAmount,
          total: acc.total + line.total,
        }),
        { subtotal: 0, taxAmount: 0, total: 0 },
      );

      // Aggregate expenses by analytical account for budget validation
      // We need to get the account names for error messages
      const analyticalAccountIds = [
        ...new Set(
          processedLines
            .filter((l) => l.analyticalAccountId)
            .map((l) => l.analyticalAccountId),
        ),
      ];
      const analyticalAccounts = await prisma.analyticalAccount.findMany({
        where: { id: { in: analyticalAccountIds } },
        select: { id: true, name: true },
      });
      const accountNameMap = new Map(
        analyticalAccounts.map((a) => [a.id, a.name]),
      );

      const expensesByAccount = new Map<
        string,
        { amount: number; accountName: string }
      >();
      for (const line of processedLines) {
        if (line.analyticalAccountId) {
          const current = expensesByAccount.get(line.analyticalAccountId);
          const accountName =
            accountNameMap.get(line.analyticalAccountId) || 'Unknown';
          if (current) {
            current.amount += line.total;
          } else {
            expensesByAccount.set(line.analyticalAccountId, {
              amount: line.total,
              accountName,
            });
          }
        }
      }

      // Validate budget limits
      const budgetValidation = await validateBudgetLimits(
        activeBudget,
        expensesByAccount,
      );

      if (!budgetValidation.isValid) {
        if (budgetValidation.errorType === 'NO_BUDGET_LINE') {
          const missingAccounts =
            budgetValidation.missingBudgetLines.join(', ');
          throw new ApiError(
            `No budget allocated for the following cost centers: ${missingAccounts}. Please add budget lines for these cost centers before creating this purchase order.`,
            400,
            'NO_BUDGET_LINE',
          );
        } else {
          const errorDetails = budgetValidation.exceededErrors
            .map(
              (err) =>
                `${err.analyticalAccountName}: Budget ₹${err.plannedAmount.toLocaleString()}, Spent ₹${err.currentSpent.toLocaleString()}, This PO ₹${err.newExpense.toLocaleString()} (Exceeds by ₹${err.wouldExceedBy.toLocaleString()})`,
            )
            .join('\n');

          throw new ApiError(
            `Purchase order exceeds budget limits:\n${errorDetails}`,
            400,
            'BUDGET_EXCEEDED',
          );
        }
      }

      const order = await prisma.purchaseOrder.create({
        data: {
          poNumber,
          vendorId,
          orderDate: poDate,
          notes,
          ...orderTotals,
          lines: {
            create: processedLines,
          },
        },
        include: {
          vendor: true,
          lines: {
            include: {
              product: true,
              analyticalAccount: true,
            },
          },
        },
      });

      // Update budget line expenses for each line with an analytical account
      for (const line of processedLines) {
        if (line.analyticalAccountId) {
          await updateBudgetLineExpense(
            line.analyticalAccountId,
            line.total,
            activeBudget.id,
          );
        }
      }

      res.status(201).json({
        status: 'success',
        message: 'Purchase order created successfully',
        data: { order, budgetUpdated: true },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update purchase order
   * PATCH /api/purchase-orders/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { vendorId, orderDate, notes, status } = req.body;

      const order = await prisma.purchaseOrder.update({
        where: { id },
        data: {
          ...(vendorId && { vendorId }),
          ...(orderDate && { orderDate: new Date(orderDate) }),
          ...(notes !== undefined && { notes }),
          ...(status && { status }),
        },
        include: {
          vendor: true,
          lines: {
            include: { product: true, analyticalAccount: true },
          },
        },
      });

      res.status(200).json({
        status: 'success',
        message: 'Purchase order updated successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete purchase order
   * DELETE /api/purchase-orders/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { vendorBills: true },
      });

      if (!order) {
        throw new ApiError('Purchase order not found', 404);
      }

      if (order.vendorBills.length > 0) {
        throw new ApiError('Cannot delete order with associated bills', 400);
      }

      if (order.status !== 'DRAFT') {
        throw new ApiError('Only draft orders can be deleted', 400);
      }

      await prisma.purchaseOrder.delete({ where: { id } });

      res.status(200).json({
        status: 'success',
        message: 'Purchase order deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Confirm purchase order
   * POST /api/purchase-orders/:id/confirm
   */
  async confirm(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const order = await prisma.purchaseOrder.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      });

      res.status(200).json({
        status: 'success',
        message: 'Purchase order confirmed',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Convert to vendor bill
   * POST /api/purchase-orders/:id/create-bill
   */
  async createBill(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { dueDate } = req.body;

      const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
          lines: true,
        },
      });

      if (!order) {
        throw new ApiError('Purchase order not found', 404);
      }

      // Generate bill number
      const today = new Date();
      const prefix = `BILL${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

      const lastBill = await prisma.vendorBill.findFirst({
        where: { billNumber: { startsWith: prefix } },
        orderBy: { billNumber: 'desc' },
      });

      const sequence = lastBill
        ? parseInt(lastBill.billNumber.slice(-4)) + 1
        : 1;

      const billNumber = `${prefix}${String(sequence).padStart(4, '0')}`;

      const bill = await prisma.vendorBill.create({
        data: {
          billNumber,
          purchaseOrderId: id,
          vendorId: order.vendorId,
          dueDate: new Date(dueDate),
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          total: order.total,
          amountDue: order.total,
          lines: {
            create: order.lines.map((line) => ({
              productId: line.productId,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
              subtotal: line.subtotal,
              taxAmount: line.taxAmount,
              total: line.total,
              analyticalAccountId: line.analyticalAccountId,
              isAutoAssigned: line.isAutoAssigned,
            })),
          },
        },
        include: {
          vendor: true,
          lines: {
            include: { product: true, analyticalAccount: true },
          },
        },
      });

      // Update PO status
      await prisma.purchaseOrder.update({
        where: { id },
        data: { status: 'BILLED' },
      });

      res.status(201).json({
        status: 'success',
        message: 'Vendor bill created from purchase order',
        data: { bill },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default purchaseOrderController;
