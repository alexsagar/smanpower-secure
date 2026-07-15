-- CreateEnum
CREATE TYPE "MediaResourceType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "CmsContentBlock" ADD COLUMN     "mobileImageId" TEXT,
ADD COLUMN     "posterImageId" TEXT,
ADD COLUMN     "videoId" TEXT;

-- AlterTable
ALTER TABLE "CmsHeroSection" ADD COLUMN     "mobileImageId" TEXT,
ADD COLUMN     "posterImageId" TEXT;

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "resourceType" "MediaResourceType";

-- Backfill existing media rows from authoritative MIME prefixes before enforcing NOT NULL.
UPDATE "MediaAsset"
SET "resourceType" = CASE
  WHEN "mimeType" LIKE 'image/%' THEN 'IMAGE'::"MediaResourceType"
  WHEN "mimeType" LIKE 'video/%' THEN 'VIDEO'::"MediaResourceType"
  ELSE 'DOCUMENT'::"MediaResourceType"
END
WHERE "resourceType" IS NULL;

ALTER TABLE "MediaAsset" ALTER COLUMN "resourceType" SET NOT NULL;

-- CreateIndex
CREATE INDEX "CmsContentBlock_videoId_idx" ON "CmsContentBlock"("videoId");

-- CreateIndex
CREATE INDEX "CmsContentBlock_posterImageId_idx" ON "CmsContentBlock"("posterImageId");

-- CreateIndex
CREATE INDEX "CmsContentBlock_mobileImageId_idx" ON "CmsContentBlock"("mobileImageId");

-- CreateIndex
CREATE INDEX "CmsHeroSection_posterImageId_idx" ON "CmsHeroSection"("posterImageId");

-- CreateIndex
CREATE INDEX "CmsHeroSection_mobileImageId_idx" ON "CmsHeroSection"("mobileImageId");

-- CreateIndex
CREATE INDEX "MediaAsset_resourceType_idx" ON "MediaAsset"("resourceType");

-- AddForeignKey
ALTER TABLE "CmsHeroSection" ADD CONSTRAINT "CmsHeroSection_posterImageId_fkey" FOREIGN KEY ("posterImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsHeroSection" ADD CONSTRAINT "CmsHeroSection_mobileImageId_fkey" FOREIGN KEY ("mobileImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsContentBlock" ADD CONSTRAINT "CmsContentBlock_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsContentBlock" ADD CONSTRAINT "CmsContentBlock_posterImageId_fkey" FOREIGN KEY ("posterImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsContentBlock" ADD CONSTRAINT "CmsContentBlock_mobileImageId_fkey" FOREIGN KEY ("mobileImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
