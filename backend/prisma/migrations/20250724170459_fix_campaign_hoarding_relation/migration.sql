-- AlterTable
ALTER TABLE "Hoarding" ADD COLUMN     "bookedTill" TIMESTAMP(3),
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "hoardingIds" TEXT[];

-- CreateTable
CREATE TABLE "CampaignHoarding" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "hoardingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignHoarding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignHoarding" ADD CONSTRAINT "CampaignHoarding_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignHoarding" ADD CONSTRAINT "CampaignHoarding_hoardingId_fkey" FOREIGN KEY ("hoardingId") REFERENCES "Hoarding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
