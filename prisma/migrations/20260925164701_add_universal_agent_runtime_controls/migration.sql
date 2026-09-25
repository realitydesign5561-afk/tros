/*
  Warnings:

  - You are about to drop the column `startedAt` on the `AgentSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AgentSession" DROP COLUMN "startedAt";

-- AlterTable
ALTER TABLE "public"."AgentTask" ADD COLUMN     "approvalGranted" BOOLEAN NOT NULL DEFAULT false;
