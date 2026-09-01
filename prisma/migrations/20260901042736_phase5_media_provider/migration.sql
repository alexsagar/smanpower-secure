-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('CLOUDINARY', 'R2');

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "provider" "MediaProvider" NOT NULL DEFAULT 'CLOUDINARY',
ADD COLUMN     "storageKey" TEXT;

-- CreateIndex
CREATE INDEX "MediaAsset_provider_idx" ON "MediaAsset"("provider");
