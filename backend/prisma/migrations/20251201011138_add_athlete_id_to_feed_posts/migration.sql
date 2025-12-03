-- AlterTable
ALTER TABLE "FeedPost" ADD COLUMN     "athleteId" TEXT;

-- CreateIndex
CREATE INDEX "FeedPost_athleteId_idx" ON "FeedPost"("athleteId");
