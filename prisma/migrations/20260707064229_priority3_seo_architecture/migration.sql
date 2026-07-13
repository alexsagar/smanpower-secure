-- AlterTable
ALTER TABLE "InsightArticle" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "SuccessStory" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "ogImage" TEXT;
