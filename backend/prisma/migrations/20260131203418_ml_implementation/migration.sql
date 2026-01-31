-- CreateTable
CREATE TABLE "categorization_suggestions" (
    "id" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "suggestedAccountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "parametersUsed" TEXT[],
    "isConflict" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorization_suggestions_pkey" PRIMARY KEY ("id")
);
