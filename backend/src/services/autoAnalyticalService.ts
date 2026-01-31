import prisma from '../config/database';
import { ApplyOn } from '@prisma/client';
import { getMLCategorization } from './mlClient';

interface LineData {
    productId: string;
    contactId: string;
    amount: number;
    type: 'PURCHASE' | 'SALE';
    date?: Date;
}

interface MatchResult {
    analyticalAccountId: string | null;
    ruleId: string | null;
    ruleName: string | null;
    isAutoAssigned: boolean;
    isConflict?: boolean;
    mlSuggestions?: any[]; // To be saved later
}

/**
 * Auto Analytical Service
 * 
 * This service automatically assigns cost centers (analytical accounts) 
 * to invoice/bill lines based on configurable rules.
 * 
 * HOW IT WORKS:
 * 1. When a line is added to a bill/invoice, this service checks all active rules
 * 2. Rules are checked in order of "sequence" (lower = higher priority)
 * 3. First matching rule wins and assigns its analytical account
 * 4. If no rule matches, returns null (user must select manually)
 */
export class AutoAnalyticalService {

    /**
     * Find matching rule and return the analytical account to assign
     */
    async findMatchingRule(lineData: LineData): Promise<MatchResult> {
        // Get the product with its category
        const product = await prisma.product.findUnique({
            where: { id: lineData.productId },
            include: { category: true }
        });

        if (!product) {
            return { analyticalAccountId: null, ruleId: null, ruleName: null, isAutoAssigned: false };
        }

        // Get all active rules, ordered by sequence
        const rules = await prisma.autoAnalyticalRule.findMany({
            where: { isActive: true },
            orderBy: { sequence: 'asc' },
            include: {
                analyticalAccount: true,
                product: true,
                productCategory: true,
                contact: true
            }
        });

        const checkDate = lineData.date || new Date();

        for (const rule of rules) {
            // Check applyOn filter
            if (rule.applyOn === 'PURCHASE' && lineData.type !== 'PURCHASE') continue;
            if (rule.applyOn === 'SALE' && lineData.type !== 'SALE') continue;

            // Check product match
            if (rule.productId && rule.productId !== lineData.productId) continue;

            // Check category match (also check parent categories)
            if (rule.productCategoryId) {
                let categoryMatch = rule.productCategoryId === product.categoryId;

                // Check parent category if exists
                if (!categoryMatch && product.category.parentId) {
                    categoryMatch = rule.productCategoryId === product.category.parentId;
                }

                if (!categoryMatch) continue;
            }

            // Check contact match
            if (rule.contactId && rule.contactId !== lineData.contactId) continue;

            // Check amount range
            if (rule.useAmountFilter) {
                const amount = lineData.amount;
                if (rule.amountMin && amount < Number(rule.amountMin)) continue;
                if (rule.amountMax && amount > Number(rule.amountMax)) continue;
            }

            // Check date validity
            if (rule.useDateFilter) {
                if (rule.dateFrom && checkDate < rule.dateFrom) continue;
                if (rule.dateTo && checkDate > rule.dateTo) continue;
            }

            // All conditions passed - this rule matches!
            // Update rule statistics
            await prisma.autoAnalyticalRule.update({
                where: { id: rule.id },
                data: {
                    timesApplied: { increment: 1 },
                    lastAppliedAt: new Date()
                }
            });

            return {
                analyticalAccountId: rule.analyticalAccountId,
                ruleId: rule.id,
                ruleName: rule.name,
                isAutoAssigned: true
            };
        }

        // ==========================================
        // ML CATEGORIZATION FALLBACK
        // ==========================================
        try {
            // Fetch contact info if needed for ML
            let contactName = '';
            if (lineData.contactId) {
                const contact = await prisma.contact.findUnique({ where: { id: lineData.contactId } });
                contactName = contact?.name || '';
            }

            // Prepare data for ML
            const mlData = {
                productName: product.name,
                productCategory: product.category?.name,
                partnerName: contactName,
                amount: lineData.amount,
                description: product.description || product.name, // Or line description if available?
                transactionType: lineData.type
            };

            const mlResult = await getMLCategorization(mlData);

            // Expected mlResult structure: { suggestions: [{ accountId, accountName, confidence }, ...] }
            // Note: If accountId comes from ML, it might be a code or name. We need to resolve to local UUID.
            // For this implementation, let's assume ML returns local UUIDs or we lookup by code/name. 
            // Assuming ML returns { accountId: "uuid", ... } for simplicity or we map it.

            if (mlResult && mlResult.suggestions && mlResult.suggestions.length > 0) {
                const suggestions = mlResult.suggestions;
                const topPrediction = suggestions[0];
                const secondPrediction = suggestions.length > 1 ? suggestions[1] : null;

                // Step B: High confidence check
                if (topPrediction.confidence > 0.85) {
                    return {
                        analyticalAccountId: topPrediction.accountId,
                        ruleId: null,
                        ruleName: 'ML_PREDICTION',
                        isAutoAssigned: true,
                        mlSuggestions: suggestions // Pass them in case we want to log
                    };
                }

                // Step C: Conflict Check
                if (secondPrediction) {
                    const diff = Math.abs(topPrediction.confidence - secondPrediction.confidence);
                    if (diff <= 0.15) {
                        // Conflict!
                        return {
                            analyticalAccountId: null, // Don't assign if conflicted
                            ruleId: null,
                            ruleName: 'ML_CONFLICT',
                            isAutoAssigned: false,
                            isConflict: true,
                            mlSuggestions: suggestions
                        };
                    }
                }

                // If neither (moderate confidence, no conflict), maybe assign the top one?
                // Or leave blank? The user only specified > 0.85. 
                // Let's assume < 0.85 and no conflict = Needs Review (similar to conflict?)
                // Or just return top one but marked as "Needs Review"? 
                // User said "Option A (48%)..." in the UI "Needs Review" modal.
                // So if < 0.85, we treat it as a potential review case.

                return {
                    analyticalAccountId: null,
                    ruleId: null,
                    ruleName: 'ML_UNCERTAIN',
                    isAutoAssigned: false,
                    isConflict: true, // Treat uncertain as conflict/review needed
                    mlSuggestions: suggestions
                };
            }

        } catch (error) {
            console.error('AutoAnalyticalService ML error:', error);
        }

        // No matching rule found and ML failed or didn't run
        return { analyticalAccountId: null, ruleId: null, ruleName: null, isAutoAssigned: false };
    }

    /**
     * Apply auto-analytical to multiple lines at once
     */
    async applyToLines(lines: LineData[]): Promise<Map<number, MatchResult>> {
        const results = new Map<number, MatchResult>();

        for (let i = 0; i < lines.length; i++) {
            const result = await this.findMatchingRule(lines[i]);
            results.set(i, result);
        }

        return results;
    }

    /**
     * Get all rules with statistics
     */
    async getRulesWithStats() {
        return prisma.autoAnalyticalRule.findMany({
            include: {
                analyticalAccount: true,
                product: true,
                productCategory: true,
                contact: true
            },
            orderBy: { sequence: 'asc' }
        });
    }

    /**
     * Test a rule against sample data (for preview)
     */
    async testRule(ruleId: string, sampleLines: LineData[]): Promise<number> {
        const rule = await prisma.autoAnalyticalRule.findUnique({
            where: { id: ruleId }
        });

        if (!rule || !rule.isActive) return 0;

        let matchCount = 0;
        for (const line of sampleLines) {
            const result = await this.findMatchingRule(line);
            if (result.ruleId === ruleId) matchCount++;
        }

        return matchCount;
    }

    /**
     * Create a new auto-analytical rule
     */
    async createRule(data: {
        name: string;
        sequence?: number;
        productId?: string;
        productCategoryId?: string;
        contactId?: string;
        useAmountFilter?: boolean;
        amountMin?: number;
        amountMax?: number;
        useDateFilter?: boolean;
        dateFrom?: Date;
        dateTo?: Date;
        applyOn?: ApplyOn;
        analyticalAccountId: string;
    }) {
        return prisma.autoAnalyticalRule.create({
            data: {
                name: data.name,
                sequence: data.sequence ?? 10,
                productId: data.productId,
                productCategoryId: data.productCategoryId,
                contactId: data.contactId,
                useAmountFilter: data.useAmountFilter ?? false,
                amountMin: data.amountMin,
                amountMax: data.amountMax,
                useDateFilter: data.useDateFilter ?? false,
                dateFrom: data.dateFrom,
                dateTo: data.dateTo,
                applyOn: data.applyOn ?? 'BOTH',
                analyticalAccountId: data.analyticalAccountId
            },
            include: {
                analyticalAccount: true,
                product: true,
                productCategory: true,
                contact: true
            }
        });
    }

    /**
     * Update a rule
     */
    async updateRule(ruleId: string, data: Partial<{
        name: string;
        sequence: number;
        isActive: boolean;
        productId: string | null;
        productCategoryId: string | null;
        contactId: string | null;
        useAmountFilter: boolean;
        amountMin: number | null;
        amountMax: number | null;
        useDateFilter: boolean;
        dateFrom: Date | null;
        dateTo: Date | null;
        applyOn: ApplyOn;
        analyticalAccountId: string;
    }>) {
        return prisma.autoAnalyticalRule.update({
            where: { id: ruleId },
            data,
            include: {
                analyticalAccount: true,
                product: true,
                productCategory: true,
                contact: true
            }
        });
    }

    /**
     * Delete a rule
     */
    async deleteRule(ruleId: string) {
        return prisma.autoAnalyticalRule.delete({
            where: { id: ruleId }
        });
    }
}

export const autoAnalyticalService = new AutoAnalyticalService();
