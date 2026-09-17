-- AlterTable
ALTER TABLE "public"."SocialPost" ADD COLUMN     "imagePrompt" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "socialAutomationEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."SocialPostAnalytics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPostAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialPostAnalytics_postId_key" ON "public"."SocialPostAnalytics"("postId");

-- AddForeignKey
ALTER TABLE "public"."SocialPostAnalytics" ADD CONSTRAINT "SocialPostAnalytics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
