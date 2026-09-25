-- AlterTable
ALTER TABLE "public"."AiModel" ADD COLUMN     "contextWindow" INTEGER,
ADD COLUMN     "inputCostPerMillion" DECIMAL(18,8),
ADD COLUMN     "outputCostPerMillion" DECIMAL(18,8);

-- AlterTable
ALTER TABLE "public"."AiProvider" ADD COLUMN     "circuitOpenedAt" TIMESTAMP(3),
ADD COLUMN     "circuitState" TEXT NOT NULL DEFAULT 'CLOSED',
ADD COLUMN     "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dailyLimit" DECIMAL(18,8),
ADD COLUMN     "fallbackPriority" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "lastFailureAt" TIMESTAMP(3),
ADD COLUMN     "lastSuccessAt" TIMESTAMP(3),
ADD COLUMN     "maxSpend" DECIMAL(18,8),
ADD COLUMN     "monthlyLimit" DECIMAL(18,8),
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "quota" JSONB;

-- AlterTable
ALTER TABLE "public"."ProviderUsage" ADD COLUMN     "contextWindow" INTEGER,
ADD COLUMN     "inputCostPerMillion" DECIMAL(18,8),
ADD COLUMN     "outputCostPerMillion" DECIMAL(18,8);
