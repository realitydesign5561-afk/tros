-- CreateTable
CREATE TABLE "public"."AiProvider" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'AI',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "baseUrl" TEXT,
    "capabilities" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiModel" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capabilities" JSONB,
    "pricing" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Credential" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "providerKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "keyVersion" TEXT NOT NULL,
    "fingerprint" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderHealth" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "errorCode" TEXT,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderUsage" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "modelId" TEXT,
    "taskId" TEXT,
    "requestId" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "durationMs" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SUCCEEDED',
    "metadata" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderCost" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "modelId" TEXT,
    "taskId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amount" DECIMAL(18,8) NOT NULL,
    "basis" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiTask" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "input" JSONB NOT NULL,
    "result" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "idempotencyKey" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "modelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiTaskStep" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AiTaskStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiTaskOutput" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "stepId" TEXT,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "uri" TEXT,
    "content" JSONB,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiTaskOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentSession" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "context" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentToolCall" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sessionId" TEXT,
    "toolKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AgentToolCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Integration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "capabilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IntegrationConnection" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "ownerId" TEXT,
    "credentialId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "externalAccountId" TEXT,
    "metadata" JSONB,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduledJob" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "input" JSONB,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutomationRun" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "taskId" TEXT,
    "scheduledJobId" TEXT,
    "workflowId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "idempotencyKey" TEXT,
    "input" JSONB,
    "output" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExecutionLog" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "runId" TEXT,
    "sequence" INTEGER NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "event" TEXT NOT NULL,
    "message" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "resource" TEXT,
    "effect" TEXT NOT NULL DEFAULT 'ALLOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeaturePermission" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "role" TEXT,
    "userId" TEXT,
    "permission" TEXT NOT NULL,
    "effect" TEXT NOT NULL DEFAULT 'ALLOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeatureHealth" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "integrationId" TEXT,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "errorCode" TEXT,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RepairAttempt" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "runId" TEXT,
    "reason" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestRun" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "testType" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "input" JSONB,
    "output" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "event" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectSnapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionId" TEXT,
    "reason" TEXT NOT NULL,
    "manifest" JSONB NOT NULL,
    "storageUri" TEXT,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "source" TEXT,
    "manifest" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiProvider_key_key" ON "public"."AiProvider"("key");

-- CreateIndex
CREATE INDEX "AiModel_status_idx" ON "public"."AiModel"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AiModel_providerId_key_key" ON "public"."AiModel"("providerId", "key");

-- CreateIndex
CREATE INDEX "Credential_ownerId_providerKey_idx" ON "public"."Credential"("ownerId", "providerKey");

-- CreateIndex
CREATE INDEX "Credential_status_expiresAt_idx" ON "public"."Credential"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "ProviderHealth_providerId_checkedAt_idx" ON "public"."ProviderHealth"("providerId", "checkedAt");

-- CreateIndex
CREATE INDEX "ProviderUsage_providerId_recordedAt_idx" ON "public"."ProviderUsage"("providerId", "recordedAt");

-- CreateIndex
CREATE INDEX "ProviderUsage_taskId_idx" ON "public"."ProviderUsage"("taskId");

-- CreateIndex
CREATE INDEX "ProviderCost_providerId_recordedAt_idx" ON "public"."ProviderCost"("providerId", "recordedAt");

-- CreateIndex
CREATE INDEX "ProviderCost_taskId_idx" ON "public"."ProviderCost"("taskId");

-- CreateIndex
CREATE INDEX "AiTask_status_availableAt_priority_idx" ON "public"."AiTask"("status", "availableAt", "priority");

-- CreateIndex
CREATE INDEX "AiTask_ownerId_createdAt_idx" ON "public"."AiTask"("ownerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiTask_ownerId_idempotencyKey_key" ON "public"."AiTask"("ownerId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "AiTaskStep_taskId_status_idx" ON "public"."AiTaskStep"("taskId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AiTaskStep_taskId_sequence_key" ON "public"."AiTaskStep"("taskId", "sequence");

-- CreateIndex
CREATE INDEX "AiTaskOutput_taskId_createdAt_idx" ON "public"."AiTaskOutput"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentSession_taskId_status_idx" ON "public"."AgentSession"("taskId", "status");

-- CreateIndex
CREATE INDEX "AgentToolCall_taskId_startedAt_idx" ON "public"."AgentToolCall"("taskId", "startedAt");

-- CreateIndex
CREATE INDEX "AgentToolCall_toolKey_status_idx" ON "public"."AgentToolCall"("toolKey", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_key_key" ON "public"."Integration"("key");

-- CreateIndex
CREATE INDEX "IntegrationConnection_ownerId_status_idx" ON "public"."IntegrationConnection"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_integrationId_ownerId_key" ON "public"."IntegrationConnection"("integrationId", "ownerId");

-- CreateIndex
CREATE INDEX "ScheduledJob_status_nextRunAt_idx" ON "public"."ScheduledJob"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "ScheduledJob_ownerId_status_idx" ON "public"."ScheduledJob"("ownerId", "status");

-- CreateIndex
CREATE INDEX "AutomationRun_status_createdAt_idx" ON "public"."AutomationRun"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationRun_ownerId_idempotencyKey_key" ON "public"."AutomationRun"("ownerId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "ExecutionLog_runId_sequence_idx" ON "public"."ExecutionLog"("runId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionLog_taskId_sequence_key" ON "public"."ExecutionLog"("taskId", "sequence");

-- CreateIndex
CREATE INDEX "UserPermission_userId_effect_idx" ON "public"."UserPermission"("userId", "effect");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permission_resource_key" ON "public"."UserPermission"("userId", "permission", "resource");

-- CreateIndex
CREATE INDEX "FeaturePermission_featureKey_role_userId_idx" ON "public"."FeaturePermission"("featureKey", "role", "userId");

-- CreateIndex
CREATE INDEX "FeatureHealth_featureKey_checkedAt_idx" ON "public"."FeatureHealth"("featureKey", "checkedAt");

-- CreateIndex
CREATE INDEX "RepairAttempt_taskId_status_idx" ON "public"."RepairAttempt"("taskId", "status");

-- CreateIndex
CREATE INDEX "RepairAttempt_runId_status_idx" ON "public"."RepairAttempt"("runId", "status");

-- CreateIndex
CREATE INDEX "TestRun_ownerId_createdAt_idx" ON "public"."TestRun"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "TestRun_status_createdAt_idx" ON "public"."TestRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SystemEvent_event_createdAt_idx" ON "public"."SystemEvent"("event", "createdAt");

-- CreateIndex
CREATE INDEX "SystemEvent_resourceType_resourceId_idx" ON "public"."SystemEvent"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "ProjectSnapshot_projectId_createdAt_idx" ON "public"."ProjectSnapshot"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectVersion_projectId_createdAt_idx" ON "public"."ProjectVersion"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVersion_projectId_version_key" ON "public"."ProjectVersion"("projectId", "version");

-- AddForeignKey
ALTER TABLE "public"."AiModel" ADD CONSTRAINT "AiModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."AiProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderHealth" ADD CONSTRAINT "ProviderHealth_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."AiProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderUsage" ADD CONSTRAINT "ProviderUsage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."AiProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderUsage" ADD CONSTRAINT "ProviderUsage_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderUsage" ADD CONSTRAINT "ProviderUsage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderCost" ADD CONSTRAINT "ProviderCost_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."AiProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderCost" ADD CONSTRAINT "ProviderCost_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderCost" ADD CONSTRAINT "ProviderCost_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiTask" ADD CONSTRAINT "AiTask_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiTaskStep" ADD CONSTRAINT "AiTaskStep_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiTaskOutput" ADD CONSTRAINT "AiTaskOutput_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentSession" ADD CONSTRAINT "AgentSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentToolCall" ADD CONSTRAINT "AgentToolCall_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentToolCall" ADD CONSTRAINT "AgentToolCall_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AgentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationRun" ADD CONSTRAINT "AutomationRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationRun" ADD CONSTRAINT "AutomationRun_scheduledJobId_fkey" FOREIGN KEY ("scheduledJobId") REFERENCES "public"."ScheduledJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExecutionLog" ADD CONSTRAINT "ExecutionLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."AiTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExecutionLog" ADD CONSTRAINT "ExecutionLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."AutomationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeatureHealth" ADD CONSTRAINT "FeatureHealth_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
