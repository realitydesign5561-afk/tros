-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "socialAutomationDays" TEXT,
ADD COLUMN     "socialAutomationNiches" TEXT,
ADD COLUMN     "socialAutomationPostsPerDay" INTEGER NOT NULL DEFAULT 1;
