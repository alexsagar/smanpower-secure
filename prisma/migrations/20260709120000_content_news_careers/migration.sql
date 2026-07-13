-- CreateEnum
CREATE TYPE "CareerOpeningStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "InsightArticle" ADD COLUMN     "lang" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "featuredImageId" TEXT,
ADD COLUMN     "lang" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "newsType" TEXT,
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "CareerOpening" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'en',
    "department" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "status" "CareerOpeningStatus" NOT NULL DEFAULT 'DRAFT',
    "applicationEmail" TEXT,
    "applicationUrl" TEXT,
    "deadline" TIMESTAMP(3),
    "featuredImageId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CareerOpening_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerOpening_slug_key" ON "CareerOpening"("slug");

-- CreateIndex
CREATE INDEX "CareerOpening_status_idx" ON "CareerOpening"("status");

-- CreateIndex
CREATE INDEX "CareerOpening_lang_idx" ON "CareerOpening"("lang");

-- CreateIndex
CREATE INDEX "CareerOpening_deadline_idx" ON "CareerOpening"("deadline");

-- CreateIndex
CREATE INDEX "NewsArticle_status_idx" ON "NewsArticle"("status");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerOpening" ADD CONSTRAINT "CareerOpening_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
