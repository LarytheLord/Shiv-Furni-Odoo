import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

export const productController = {
  /**
   * Get all products
   * GET /api/products
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, search, categoryId, isActive } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { code: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        where.categoryId = String(categoryId);
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, code: true },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { name: 'asc' },
        }),
        prisma.product.count({ where }),
      ]);

      res.status(200).json({
        status: 'success',
        data: { products },
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
   * Get all categories
   * GET /api/products/categories
   */
  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categories = await prisma.productCategory.findMany({
        where: { isActive: true },
        include: {
          parent: {
            select: { id: true, name: true },
          },
          children: {
            select: { id: true, name: true },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      res.status(200).json({
        status: 'success',
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!product) {
        throw new ApiError('Product not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create product
   * POST /api/products
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        code,
        name,
        description,
        categoryId,
        categoryName,
        costPrice,
        salePrice,
        taxRate,
        unit,
      } = req.body;

      // Check if code is unique
      if (code) {
        const existing = await prisma.product.findUnique({ where: { code } });
        if (existing) {
          throw new ApiError('Product code already exists', 400);
        }
      }

      // Handle category - create on the fly if categoryName is provided without categoryId
      let finalCategoryId = categoryId;
      if (!categoryId && categoryName) {
        // Check if category with this name already exists
        let category = await prisma.productCategory.findFirst({
          where: { name: { equals: categoryName, mode: 'insensitive' } },
        });
        if (!category) {
          category = await prisma.productCategory.create({
            data: { name: categoryName },
          });
        }
        finalCategoryId = category.id;
      }

      const product = await prisma.product.create({
        data: {
          code,
          name,
          description,
          categoryId: finalCategoryId,
          costPrice: costPrice || 0,
          salePrice: salePrice || 0,
          taxRate: taxRate || 0,
          unit: unit || 'PCS',
        },
        include: { category: true },
      });

      res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update product
   * PATCH /api/products/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        code,
        name,
        description,
        categoryId,
        costPrice,
        salePrice,
        taxRate,
        unit,
        isActive,
      } = req.body;

      // Check if new code conflicts
      if (code) {
        const existing = await prisma.product.findFirst({
          where: { code, NOT: { id } },
        });
        if (existing) {
          throw new ApiError('Product code already exists', 400);
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(code && { code }),
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(categoryId && { categoryId }),
          ...(costPrice !== undefined && { costPrice }),
          ...(salePrice !== undefined && { salePrice }),
          ...(taxRate !== undefined && { taxRate }),
          ...(unit && { unit }),
          ...(typeof isActive === 'boolean' && { isActive }),
        },
        include: { category: true },
      });

      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Check for usage
      const [poLines, billLines, soLines, invLines] = await Promise.all([
        prisma.purchaseOrderLine.count({ where: { productId: id } }),
        prisma.vendorBillLine.count({ where: { productId: id } }),
        prisma.salesOrderLine.count({ where: { productId: id } }),
        prisma.customerInvoiceLine.count({ where: { productId: id } }),
      ]);

      if (poLines > 0 || billLines > 0 || soLines > 0 || invLines > 0) {
        await prisma.product.update({
          where: { id },
          data: { isActive: false },
        });

        res.status(200).json({
          status: 'success',
          message: 'Product deactivated (used in transactions)',
        });
        return;
      }

      await prisma.product.delete({ where: { id } });

      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create category
   * POST /api/products/categories
   */
  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, code, parentId } = req.body;

      if (code) {
        const existing = await prisma.productCategory.findUnique({
          where: { code },
        });
        if (existing) {
          throw new ApiError('Category code already exists', 400);
        }
      }

      const category = await prisma.productCategory.create({
        data: { name, code, parentId },
        include: { parent: true },
      });

      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update category
   * PATCH /api/products/categories/:id
   */
  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name, code, parentId, isActive } = req.body;

      if (code) {
        const existing = await prisma.productCategory.findFirst({
          where: { code, NOT: { id } },
        });
        if (existing) {
          throw new ApiError('Category code already exists', 400);
        }
      }

      const category = await prisma.productCategory.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(code !== undefined && { code }),
          ...(parentId !== undefined && { parentId }),
          ...(typeof isActive === 'boolean' && { isActive }),
        },
        include: { parent: true },
      });

      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete category
   * DELETE /api/products/categories/:id
   */
  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const productCount = await prisma.product.count({
        where: { categoryId: id },
      });

      if (productCount > 0) {
        throw new ApiError('Cannot delete category with products', 400);
      }

      await prisma.productCategory.delete({ where: { id } });

      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
