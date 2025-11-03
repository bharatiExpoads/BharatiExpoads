-- CreateEnum
CREATE TYPE "HoardingType" AS ENUM ('Hoarding', 'LED', 'PromotionVehicle', 'BusQueShelter', 'BusBranding', 'PoleKiosk');

-- CreateEnum
CREATE TYPE "LabourType" AS ENUM ('Fabricator', 'Mounter');

-- AlterTable
ALTER TABLE "Hoarding" ADD COLUMN     "hoardingType" "HoardingType" NOT NULL DEFAULT 'Hoarding';

-- AlterTable
ALTER TABLE "Labour" ADD COLUMN     "labourType" "LabourType" NOT NULL DEFAULT 'Fabricator';

-- CreateTable
CREATE TABLE "Printer" (
    "id" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'printer',
    "address" TEXT NOT NULL,
    "gstNo" TEXT NOT NULL,
    "bankDetails" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Printer" ADD CONSTRAINT "Printer_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
