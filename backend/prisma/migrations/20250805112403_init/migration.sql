-- CreateTable
CREATE TABLE "Designer" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'designer',
    "address" TEXT NOT NULL,
    "gstNo" TEXT NOT NULL,
    "bankDetails" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Designer" ADD CONSTRAINT "Designer_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
