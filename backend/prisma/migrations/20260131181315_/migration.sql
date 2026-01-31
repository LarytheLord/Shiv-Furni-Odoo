/*
  Warnings:

  - A unique constraint covering the columns `[budgetId,analyticalAccountId,type]` on the table `budget_lines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[originalBudgetId]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BudgetLineType" AS ENUM ('INCOME', 'EXPENSE');

-- DropIndex
DROP INDEX "budget_lines_budgetId_analyticalAccountId_key";

-- AlterTable
ALTER TABLE "budget_lines" ADD COLUMN     "achievedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "isMonetary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "BudgetLineType" NOT NULL DEFAULT 'EXPENSE';

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "originalBudgetId" TEXT,
ADD COLUMN     "revisionDate" TIMESTAMP(3),
ADD COLUMN     "revisionNumber" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "budget_lines_budgetId_analyticalAccountId_type_key" ON "budget_lines"("budgetId", "analyticalAccountId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_originalBudgetId_key" ON "budgets"("originalBudgetId");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_originalBudgetId_fkey" FOREIGN KEY ("originalBudgetId") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
