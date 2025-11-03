/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `EmployeeMaster` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `EmployeeMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeMaster" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeMaster_userId_key" ON "EmployeeMaster"("userId");

-- AddForeignKey
ALTER TABLE "EmployeeMaster" ADD CONSTRAINT "EmployeeMaster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
