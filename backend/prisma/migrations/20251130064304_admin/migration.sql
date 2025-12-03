-- AlterTable
ALTER TABLE "AthleteProfile" ADD COLUMN     "brandFitSummary" TEXT;

-- CreateTable
CREATE TABLE "ScenarioIdea" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "idealBrands" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioIdea_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScenarioIdea" ADD CONSTRAINT "ScenarioIdea_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
