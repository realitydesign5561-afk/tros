-- AlterTable
ALTER TABLE "public"."ProjectVersion" ADD COLUMN     "buildId" TEXT;

-- CreateTable
CREATE TABLE "public"."WebsiteBuild" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "stage" TEXT NOT NULL DEFAULT 'PROMPT',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "requirements" JSONB,
    "sitePlan" JSONB,
    "brandSystem" JSONB,
    "pagePlan" JSONB,
    "componentPlan" JSONB,
    "databasePlan" JSONB,
    "apiPlan" JSONB,
    "testReport" JSONB,
    "previewUrl" TEXT,
    "deploymentUrl" TEXT,
    "deploymentId" TEXT,
    "error" TEXT,
    "currentStep" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebsiteBuildStep" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WebsiteBuildStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebsiteFile" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'SOURCE',
    "content" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WebsiteFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebsiteBuildLog" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "stage" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteBuildLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteBuild_ownerId_createdAt_idx" ON "public"."WebsiteBuild"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteBuild_status_createdAt_idx" ON "public"."WebsiteBuild"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteBuild_projectId_createdAt_idx" ON "public"."WebsiteBuild"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteBuildStep_buildId_status_idx" ON "public"."WebsiteBuildStep"("buildId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteBuildStep_buildId_sequence_key" ON "public"."WebsiteBuildStep"("buildId", "sequence");

-- CreateIndex
CREATE INDEX "WebsiteFile_buildId_kind_idx" ON "public"."WebsiteFile"("buildId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteFile_buildId_path_key" ON "public"."WebsiteFile"("buildId", "path");

-- CreateIndex
CREATE INDEX "WebsiteBuildLog_buildId_createdAt_idx" ON "public"."WebsiteBuildLog"("buildId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteBuildLog_buildId_sequence_key" ON "public"."WebsiteBuildLog"("buildId", "sequence");

-- CreateIndex
CREATE INDEX "ProjectVersion_buildId_idx" ON "public"."ProjectVersion"("buildId");

-- AddForeignKey
ALTER TABLE "public"."ProjectVersion" ADD CONSTRAINT "ProjectVersion_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."WebsiteBuild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebsiteBuild" ADD CONSTRAINT "WebsiteBuild_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebsiteBuildStep" ADD CONSTRAINT "WebsiteBuildStep_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."WebsiteBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebsiteFile" ADD CONSTRAINT "WebsiteFile_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."WebsiteBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebsiteBuildLog" ADD CONSTRAINT "WebsiteBuildLog_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."WebsiteBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
