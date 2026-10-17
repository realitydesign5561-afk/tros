CREATE TABLE "Agent" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "module" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Agent_module_key" ON "Agent"("module");

CREATE TABLE "AgentTask" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "agentId" TEXT,
  "module" TEXT NOT NULL DEFAULT 'general',
  "prompt" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "currentStep" TEXT,
  "input" JSONB,
  "output" JSONB,
  "error" TEXT,
  "conversationId" TEXT,
  "idempotencyKey" TEXT,
  "lockedBy" TEXT,
  "lockedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgentTask_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AgentTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AgentTask_userId_idempotencyKey_key" ON "AgentTask"("userId", "idempotencyKey");
CREATE INDEX "AgentTask_status_availableAt_idx" ON "AgentTask"("status", "availableAt");
CREATE INDEX "AgentTask_userId_createdAt_idx" ON "AgentTask"("userId", "createdAt");

CREATE TABLE "AgentStep" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "input" JSONB,
  "output" JSONB,
  "error" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentStep_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AgentStep_taskId_sequence_key" ON "AgentStep"("taskId", "sequence");

CREATE TABLE "AgentToolCall" (
  "id" TEXT NOT NULL,
  "stepId" TEXT NOT NULL,
  "tool" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "input" JSONB,
  "output" JSONB,
  "error" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AgentToolCall_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentToolCall_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "AgentStep"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AgentArtifact" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentArtifact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentArtifact_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AgentError" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "retryable" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentError_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentError_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AgentCheckpoint" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "state" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentCheckpoint_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentCheckpoint_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AgentCheckpoint_taskId_sequence_key" ON "AgentCheckpoint"("taskId", "sequence");

CREATE TABLE "AgentEvent" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AgentEvent_taskId_sequence_key" ON "AgentEvent"("taskId", "sequence");

CREATE TABLE "AgentMessage" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentMessage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
