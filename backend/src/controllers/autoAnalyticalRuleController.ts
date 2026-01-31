import { Request, Response, NextFunction } from 'express';
import { autoAnalyticalService } from '../services/autoAnalyticalService';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

export const autoAnalyticalRuleController = {
    /**
     * Get all auto-analytical rules
     * GET /api/auto-analytical-rules
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rules = await autoAnalyticalService.getRulesWithStats();

            res.status(200).json({
                status: 'success',
                data: { rules }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get rule by ID
     * GET /api/auto-analytical-rules/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const rule = await prisma.autoAnalyticalRule.findUnique({
                where: { id },
                include: {
                    analyticalAccount: true,
                    product: true,
                    productCategory: true,
                    contact: true
                }
            });

            if (!rule) {
                throw new ApiError('Rule not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { rule }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create auto-analytical rule
     * POST /api/auto-analytical-rules
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                name,
                sequence,
                productId,
                productCategoryId,
                contactId,
                useAmountFilter,
                amountMin,
                amountMax,
                useDateFilter,
                dateFrom,
                dateTo,
                applyOn,
                analyticalAccountId
            } = req.body;

            const rule = await autoAnalyticalService.createRule({
                name,
                sequence,
                productId,
                productCategoryId,
                contactId,
                useAmountFilter,
                amountMin,
                amountMax,
                useDateFilter,
                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                dateTo: dateTo ? new Date(dateTo) : undefined,
                applyOn,
                analyticalAccountId
            });

            res.status(201).json({
                status: 'success',
                message: 'Auto-analytical rule created successfully',
                data: { rule }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update auto-analytical rule
     * PATCH /api/auto-analytical-rules/:id
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const {
                name,
                sequence,
                isActive,
                productId,
                productCategoryId,
                contactId,
                useAmountFilter,
                amountMin,
                amountMax,
                useDateFilter,
                dateFrom,
                dateTo,
                applyOn,
                analyticalAccountId
            } = req.body;

            const rule = await autoAnalyticalService.updateRule(id, {
                ...(name && { name }),
                ...(sequence !== undefined && { sequence }),
                ...(typeof isActive === 'boolean' && { isActive }),
                ...(productId !== undefined && { productId }),
                ...(productCategoryId !== undefined && { productCategoryId }),
                ...(contactId !== undefined && { contactId }),
                ...(typeof useAmountFilter === 'boolean' && { useAmountFilter }),
                ...(amountMin !== undefined && { amountMin }),
                ...(amountMax !== undefined && { amountMax }),
                ...(typeof useDateFilter === 'boolean' && { useDateFilter }),
                ...(dateFrom !== undefined && { dateFrom: dateFrom ? new Date(dateFrom) : null }),
                ...(dateTo !== undefined && { dateTo: dateTo ? new Date(dateTo) : null }),
                ...(applyOn && { applyOn }),
                ...(analyticalAccountId && { analyticalAccountId })
            });

            res.status(200).json({
                status: 'success',
                message: 'Rule updated successfully',
                data: { rule }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete auto-analytical rule
     * DELETE /api/auto-analytical-rules/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            await autoAnalyticalService.deleteRule(id);

            res.status(200).json({
                status: 'success',
                message: 'Rule deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Test a rule against sample data
     * POST /api/auto-analytical-rules/:id/test
     */
    async testRule(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { sampleLines } = req.body;

            const matchCount = await autoAnalyticalService.testRule(id, sampleLines);

            res.status(200).json({
                status: 'success',
                data: { matchCount, totalLines: sampleLines.length }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Find matching rule for a line
     * POST /api/auto-analytical-rules/match
     */
    async findMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { productId, contactId, amount, type } = req.body;

            const result = await autoAnalyticalService.findMatchingRule({
                productId,
                contactId,
                amount,
                type
            });

            res.status(200).json({
                status: 'success',
                data: { match: result }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Reorder rules (update sequences)
     * POST /api/auto-analytical-rules/reorder
     */
    async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { orderedIds } = req.body; // Array of rule IDs in new order

            const updates = orderedIds.map((id: string, index: number) =>
                prisma.autoAnalyticalRule.update({
                    where: { id },
                    data: { sequence: (index + 1) * 10 }
                })
            );

            await prisma.$transaction(updates);

            const rules = await autoAnalyticalService.getRulesWithStats();

            res.status(200).json({
                status: 'success',
                message: 'Rules reordered successfully',
                data: { rules }
            });
        } catch (error) {
            next(error);
        }
    }
};

export default autoAnalyticalRuleController;
