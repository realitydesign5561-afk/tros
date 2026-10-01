-- Add nullable per-user idempotency keys to durable agent tasks.
ALTER TABLE "public"."AgentTask"
ADD COLUMN "idempotencyKey" TEXT;

CREATE UNIQUE INDEX "AgentTask_userId_idempotencyKey_key"
ON "public"."AgentTask"("userId", "idempotencyKey");
