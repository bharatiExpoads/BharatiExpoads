-- CreateEnum
CREATE TYPE "EnquiryType" AS ENUM ('Agency', 'Client');

-- CreateEnum
CREATE TYPE "MediaRequirement" AS ENUM ('Hoarding', 'LED', 'PromotionVehicle', 'BusQueShelter', 'BusBranding', 'PoleKiosk', 'ALL');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed');

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "type" "EnquiryType" NOT NULL,
    "mediaRequirement" "MediaRequirement" NOT NULL,
    "locationState" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "manualLocation" TEXT,
    "tentativeStartDate" TIMESTAMP(3) NOT NULL,
    "tentativeDuration" TEXT NOT NULL,
    "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'NotStarted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" SERIAL NOT NULL,
    "enquiryId" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
