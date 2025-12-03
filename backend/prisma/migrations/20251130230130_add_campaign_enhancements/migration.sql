/*
  Warnings:

  - Added the required column `type` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('SOCIAL_MEDIA_POST', 'COMMERCIAL_VIDEO', 'IN_PERSON_APPEARANCE', 'PRODUCT_ENDORSEMENT', 'AUTOGRAPH_SIGNING', 'SPEAKING_ENGAGEMENT', 'PHOTO_SHOOT', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "EarningsSplitMethod" AS ENUM ('EQUAL', 'CUSTOM');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "address" TEXT,
ADD COLUMN     "earningsSplitMethod" "EarningsSplitMethod" NOT NULL DEFAULT 'EQUAL',
ADD COLUMN     "isOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalEarnings" DOUBLE PRECISION,
ADD COLUMN     "type" "CampaignType";

-- Update existing campaigns with a default type
UPDATE "Campaign" SET "type" = 'SOCIAL_MEDIA_POST' WHERE "type" IS NULL;

-- Now make it required
ALTER TABLE "Campaign" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "CampaignParticipant" ADD COLUMN     "appliedAt" TIMESTAMP(3),
ADD COLUMN     "earnings" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FeedPost" ADD COLUMN     "isOpen" BOOLEAN;
