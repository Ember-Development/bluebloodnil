-- CreateEnum
CREATE TYPE "TodoVerificationType" AS ENUM ('SOCIAL_POST', 'IN_PERSON_EVENT', 'COMMERCIAL_VIDEO', 'OTHER');

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "verificationNotes" TEXT,
ADD COLUMN     "verificationType" "TodoVerificationType",
ADD COLUMN     "verificationUrl" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
