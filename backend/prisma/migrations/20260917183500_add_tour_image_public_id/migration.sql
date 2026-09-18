-- AlterTable
ALTER TABLE "TourImage" ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TourImage_publicId_key" ON "TourImage"("publicId");
