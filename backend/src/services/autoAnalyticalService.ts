import prisma from '../config/database';
import { ApplyOn } from '@prisma/client';

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

        // No matching rule found
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
