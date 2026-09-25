-- AlterTable
ALTER TABLE "public"."AgentSession" ADD COLUMN     "agentTaskId" TEXT;

-- AlterTable
ALTER TABLE "public"."AgentToolCall" ADD COLUMN     "agentTaskId" TEXT,
ADD COLUMN     "stepId" TEXT;

-- CreateTable
CREATE TABLE "public"."Agent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "systemInstructions" TEXT NOT NULL,
    "capabilities" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "agentId" TEXT,
    "conversationId" TEXT,
    "module" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "plan" JSONB,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "currentStep" TEXT,
    "error" TEXT,
    "output" JSONB,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentStep" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentArtifact" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "stepId" TEXT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uri" TEXT,
    "content" JSONB,
    "checksum" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentError" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "stepId" TEXT,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentCheckpoint" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "stepId" TEXT,
    "name" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentEvent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "progress" INTEGER,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentMessage" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_key_key" ON "public"."Agent"("key");

-- CreateIndex
CREATE INDEX "AgentTask_status_availableAt_idx" ON "public"."AgentTask"("status", "availableAt");

-- CreateIndex
CREATE INDEX "AgentTask_userId_createdAt_idx" ON "public"."AgentTask"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentTask_conversationId_createdAt_idx" ON "public"."AgentTask"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentStep_taskId_status_idx" ON "public"."AgentStep"("taskId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AgentStep_taskId_sequence_key" ON "public"."AgentStep"("taskId", "sequence");

-- CreateIndex
CREATE INDEX "AgentArtifact_taskId_createdAt_idx" ON "public"."AgentArtifact"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentError_taskId_createdAt_idx" ON "public"."AgentError"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentCheckpoint_taskId_createdAt_idx" ON "public"."AgentCheckpoint"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentEvent_taskId_createdAt_idx" ON "public"."AgentEvent"("taskId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentEvent_taskId_sequence_key" ON "public"."AgentEvent"("taskId", "sequence");

-- CreateIndex
CREATE INDEX "AgentMessage_conversationId_createdAt_idx" ON "public"."AgentMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AgentSession" ADD CONSTRAINT "AgentSession_agentTaskId_fkey" FOREIGN KEY ("agentTaskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentToolCall" ADD CONSTRAINT "AgentToolCall_agentTaskId_fkey" FOREIGN KEY ("agentTaskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentToolCall" ADD CONSTRAINT "AgentToolCall_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."AgentStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentTask" ADD CONSTRAINT "AgentTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentStep" ADD CONSTRAINT "AgentStep_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentArtifact" ADD CONSTRAINT "AgentArtifact_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentError" ADD CONSTRAINT "AgentError_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentCheckpoint" ADD CONSTRAINT "AgentCheckpoint_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentEvent" ADD CONSTRAINT "AgentEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentMessage" ADD CONSTRAINT "AgentMessage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
