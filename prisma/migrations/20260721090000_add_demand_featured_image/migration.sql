-- AlterTable
ALTER TABLE "Demand" ADD COLUMN     "featuredImageId" TEXT;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
