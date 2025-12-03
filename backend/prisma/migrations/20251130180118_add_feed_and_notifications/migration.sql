-- CreateEnum
CREATE TYPE "FeedPostType" AS ENUM ('ATHLETE_UPDATE', 'CAMPAIGN', 'ORG_ANNOUNCEMENT', 'COMMITMENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CAMPAIGN_ASSIGNED', 'CAMPAIGN_CREATED', 'BRAND_ADDED', 'TODO_ASSIGNED', 'SYSTEM_ANNOUNCEMENT');

-- CreateTable
CREATE TABLE "FeedPost" (
    "id" TEXT NOT NULL,
    "type" "FeedPostType" NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorAvatarUrl" TEXT,
    "authorOrg" TEXT,
    "statLine" TEXT,
    "mediaUrl" TEXT,
    "brand" TEXT,
    "brandLogoUrl" TEXT,
    "objective" TEXT,
    "campaignStatus" TEXT,
    "program" TEXT,
    "level" TEXT,
    "campaignId" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "campaignId" TEXT,
    "todoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedPost_type_idx" ON "FeedPost"("type");

-- CreateIndex
CREATE INDEX "FeedPost_campaignId_idx" ON "FeedPost"("campaignId");

-- CreateIndex
CREATE INDEX "FeedPost_organizationId_idx" ON "FeedPost"("organizationId");

-- CreateIndex
CREATE INDEX "FeedPost_createdAt_idx" ON "FeedPost"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
