/*
  Warnings:

  - You are about to drop the column `commissionRate` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `creditPeriod` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Creditor` table. All the data in the column will be lost.
  - You are about to drop the column `creditLimit` on the `Creditor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Creditor` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `Creditor` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `Creditor` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Creditor` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `EmployeeMaster` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `EmployeeMaster` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `EmployeeMaster` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `EmployeeMaster` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `EmployeeMaster` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `EmployeeMaster` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Hoarding` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyCost` on the `Hoarding` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Hoarding` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Hoarding` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Hoarding` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `dailyRate` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `joiningDate` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Landlord` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Landlord` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `Landlord` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Landlord` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `Landlord` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Agency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPersonNumber` to the `Agency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstNo` to the `Agency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landlineNumber` to the `Agency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNo` to the `Agency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappNumber` to the `Agency` table without a default value. This is not possible if the table is not empty.
  - Made the column `contactPerson` on table `Agency` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Agency` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPersonNumber` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstNo` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landlineNumber` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNo` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappNumber` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Made the column `contactPerson` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bankDetails` to the `Creditor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Creditor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPersonNumber` to the `Creditor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstNo` to the `Creditor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landlineNumber` to the `Creditor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNo` to the `Creditor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappNumber` to the `Creditor` table without a default value. This is not possible if the table is not empty.
  - Made the column `contactPerson` on table `Creditor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Creditor` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bankDetails` to the `EmployeeMaster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeName` to the `EmployeeMaster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officialEmail` to the `EmployeeMaster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNumber` to the `EmployeeMaster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalEmail` to the `EmployeeMaster` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `EmployeeMaster` required. This step will fail if there are existing NULL values in that column.
  - Made the column `joiningDate` on table `EmployeeMaster` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salary` on table `EmployeeMaster` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `availability` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayChargesPerMonth` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `illumination` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oneTimeMountingCost` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oneTimePrintingCost` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSqFt` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Hoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankDetails` to the `Labour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Labour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstNo` to the `Labour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNumber` to the `Labour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personName` to the `Labour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Labour` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `Labour` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `hikeAfterYears` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hikePercentage` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landlordName` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentAmount` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `Landlord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bankDetails` on table `Landlord` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('IMMEDIATELY', 'FURTHER_DATE');

-- DropIndex
DROP INDEX "EmployeeMaster_email_key";

-- AlterTable
ALTER TABLE "Agency" DROP COLUMN "commissionRate",
DROP COLUMN "contactNumber",
DROP COLUMN "email",
DROP COLUMN "gstNumber",
DROP COLUMN "panNumber",
DROP COLUMN "status",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactPersonNumber" TEXT NOT NULL,
ADD COLUMN     "gstNo" TEXT NOT NULL,
ADD COLUMN     "landlineNumber" TEXT NOT NULL,
ADD COLUMN     "panNo" TEXT NOT NULL,
ADD COLUMN     "whatsappNumber" TEXT NOT NULL,
ALTER COLUMN "contactPerson" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "contactNumber",
DROP COLUMN "creditPeriod",
DROP COLUMN "email",
DROP COLUMN "gstNumber",
DROP COLUMN "panNumber",
DROP COLUMN "status",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactPersonNumber" TEXT NOT NULL,
ADD COLUMN     "gstNo" TEXT NOT NULL,
ADD COLUMN     "landlineNumber" TEXT NOT NULL,
ADD COLUMN     "panNo" TEXT NOT NULL,
ADD COLUMN     "whatsappNumber" TEXT NOT NULL,
ALTER COLUMN "contactPerson" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "Creditor" DROP COLUMN "contactNumber",
DROP COLUMN "creditLimit",
DROP COLUMN "email",
DROP COLUMN "gstNumber",
DROP COLUMN "panNumber",
DROP COLUMN "status",
ADD COLUMN     "bankDetails" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactPersonNumber" TEXT NOT NULL,
ADD COLUMN     "gstNo" TEXT NOT NULL,
ADD COLUMN     "landlineNumber" TEXT NOT NULL,
ADD COLUMN     "panNo" TEXT NOT NULL,
ADD COLUMN     "whatsappNumber" TEXT NOT NULL,
ALTER COLUMN "contactPerson" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "EmployeeMaster" DROP COLUMN "contactNumber",
DROP COLUMN "department",
DROP COLUMN "designation",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "status",
ADD COLUMN     "bankDetails" TEXT NOT NULL,
ADD COLUMN     "employeeName" TEXT NOT NULL,
ADD COLUMN     "officialEmail" TEXT NOT NULL,
ADD COLUMN     "panNumber" TEXT NOT NULL,
ADD COLUMN     "personalEmail" TEXT NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "joiningDate" SET NOT NULL,
ALTER COLUMN "salary" SET NOT NULL;

-- AlterTable
ALTER TABLE "Hoarding" DROP COLUMN "endDate",
DROP COLUMN "monthlyCost",
DROP COLUMN "name",
DROP COLUMN "size",
DROP COLUMN "startDate",
ADD COLUMN     "availability" "Availability" NOT NULL,
ADD COLUMN     "displayChargesPerMonth" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "illumination" BOOLEAN NOT NULL,
ADD COLUMN     "oneTimeMountingCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "oneTimePrintingCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalSqFt" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "mediaType" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Labour" DROP COLUMN "contactNumber",
DROP COLUMN "dailyRate",
DROP COLUMN "joiningDate",
DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "specialization",
DROP COLUMN "status",
ADD COLUMN     "bankDetails" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "gstNo" TEXT NOT NULL,
ADD COLUMN     "panNumber" TEXT NOT NULL,
ADD COLUMN     "personName" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "Landlord" DROP COLUMN "contactNumber",
DROP COLUMN "email",
DROP COLUMN "gstNumber",
DROP COLUMN "name",
DROP COLUMN "panNumber",
ADD COLUMN     "hikeAfterYears" INTEGER NOT NULL,
ADD COLUMN     "hikePercentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "landlordName" TEXT NOT NULL,
ADD COLUMN     "rentAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "bankDetails" SET NOT NULL;
