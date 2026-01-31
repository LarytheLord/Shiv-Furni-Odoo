import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

export const mlController = {
    /**
     * Get all pending conflicts
     * GET /api/ml/conflicts
     */
    async getConflicts(req: Request, res: Response, next: NextFunction) {
        try {
            const conflicts = await prisma.categorizationSuggestion.findMany({
                where: { isConflict: true, status: 'PENDING' },
                orderBy: { createdAt: 'desc' },
            });

            res.json({
                status: 'success',
                data: { conflicts }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Resolve a conflict by accepting a suggestion
     * POST /api/ml/resolve
     */
    async resolveConflict(req: Request, res: Response, next: NextFunction) {
        try {
            const { suggestionId } = req.body;

            const suggestion = await prisma.categorizationSuggestion.findUnique({
                where: { id: suggestionId }
            });

            if (!suggestion) {
                throw new ApiError('Suggestion not found', 404);
            }

            const { transactionId, transactionType, suggestedAccountId } = suggestion;

            // Update the transaction line based on type
            if (transactionType === 'BILL') {
                await prisma.vendorBillLine.update({
                    where: { id: transactionId },
                    data: {
                        analyticalAccountId: suggestedAccountId,
                        isAutoAssigned: true
                    }
                });
            } else if (transactionType === 'INVOICE') {
                await prisma.customerInvoiceLine.update({
                    where: { id: transactionId },
                    data: {
                        analyticalAccountId: suggestedAccountId,
                        isAutoAssigned: true
                    }
                });
            }

            // Update this suggestion status to ACCEPTED
            await prisma.categorizationSuggestion.update({
                where: { id: suggestionId },
                data: { status: 'ACCEPTED' }
            });

            // Mark sibling suggestions as REJECTED
            await prisma.categorizationSuggestion.updateMany({
                where: {
                    transactionId: transactionId,
                    transactionType: transactionType,
                    id: { not: suggestionId },
                    status: 'PENDING'
                },
                data: { status: 'REJECTED' }
            });

            // TODO: Trigger feedback loop to ML service

            res.status(200).json({
                status: 'success',
                message: 'Conflict resolved successfully'
            });
        } catch (error) {
            next(error);
        }
    }
};
