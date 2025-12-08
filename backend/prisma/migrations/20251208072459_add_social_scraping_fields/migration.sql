-- AlterTable
ALTER TABLE "AthleteSocialProfile" ADD COLUMN     "lastScrapedAt" TIMESTAMP(3),
ADD COLUMN     "scrapingError" TEXT,
ADD COLUMN     "scrapingStatus" TEXT,
ADD COLUMN     "totalReach" INTEGER;
