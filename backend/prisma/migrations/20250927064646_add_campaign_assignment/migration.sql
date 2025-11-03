-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_ASSIGNMENT', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "assignedToId" TEXT;

-- AlterTable
ALTER TABLE "CampaignAssets" ADD COLUMN     "uploadedById" TEXT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "EmployeeMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAssets" ADD CONSTRAINT "CampaignAssets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
