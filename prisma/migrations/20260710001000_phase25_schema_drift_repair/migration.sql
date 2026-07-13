DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DocumentType') THEN
    CREATE TYPE "DocumentType" AS ENUM ('CV', 'PASSPORT_COPY', 'TRADE_CERTIFICATE', 'TRAINING_CERTIFICATE', 'PHOTO', 'DRIVING_LICENSE', 'OTHER_APPROVED_DOCUMENT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StoryType') THEN
    CREATE TYPE "StoryType" AS ENUM ('CANDIDATE', 'EMPLOYER', 'TRAINING', 'ETHICAL_RECRUITMENT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PartnerCategory') THEN
    CREATE TYPE "PartnerCategory" AS ENUM ('PARTNER', 'GROUP_COMPANY', 'CLIENT', 'EMPLOYER');
  END IF;
END $$;

ALTER TABLE "CandidateProfile"
  ADD COLUMN IF NOT EXISTS "district" TEXT,
  ADD COLUMN IF NOT EXISTS "province" TEXT;

ALTER TABLE "ClientPartner"
  ADD COLUMN IF NOT EXISTS "category" "PartnerCategory" NOT NULL DEFAULT 'PARTNER';

ALTER TABLE "DemandApplication"
  ADD COLUMN IF NOT EXISTS "districtSnapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "education" TEXT,
  ADD COLUMN IF NOT EXISTS "experience" TEXT,
  ADD COLUMN IF NOT EXISTS "possibleDuplicate" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "provinceSnapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "skills" TEXT;

ALTER TABLE "InsightArticle"
  ADD COLUMN IF NOT EXISTS "featuredImageId" TEXT,
  ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ogDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "ogTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "readingTime" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "tags" TEXT[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'InsightArticle' AND column_name = 'isPublished'
  ) THEN
    UPDATE "InsightArticle"
    SET "status" = CASE WHEN "isPublished" THEN 'PUBLISHED'::"ContentStatus" ELSE "status" END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'InsightArticle' AND column_name = 'featuredImage'
  ) THEN
    UPDATE "InsightArticle"
    SET "internalNotes" = concat_ws(E'\n', "internalNotes", 'Legacy featured image URL: ' || "featuredImage")
    WHERE "featuredImage" IS NOT NULL AND "featuredImage" <> '';
  END IF;
END $$;

ALTER TABLE "InsightArticle"
  DROP COLUMN IF EXISTS "featuredImage",
  DROP COLUMN IF EXISTS "isPublished";

ALTER TABLE "SEOPageMeta"
  ADD COLUMN IF NOT EXISTS "lang" TEXT NOT NULL DEFAULT 'en';

ALTER TABLE "SuccessStory"
  ADD COLUMN IF NOT EXISTS "consentConfirmed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "featuredImageId" TEXT,
  ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ogDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "ogTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "quote" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SuccessStory' AND column_name = 'consentGiven'
  ) THEN
    UPDATE "SuccessStory"
    SET "consentConfirmed" = "consentGiven";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SuccessStory' AND column_name = 'isPublished'
  ) THEN
    UPDATE "SuccessStory"
    SET
      "status" = CASE WHEN "isPublished" THEN 'PUBLISHED'::"ContentStatus" ELSE "status" END,
      "publishedAt" = CASE WHEN "isPublished" THEN COALESCE("publishedAt", "updatedAt") ELSE "publishedAt" END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SuccessStory' AND column_name = 'image'
  ) THEN
    UPDATE "SuccessStory"
    SET "internalNotes" = concat_ws(E'\n', "internalNotes", 'Legacy image URL: ' || "image")
    WHERE "image" IS NOT NULL AND "image" <> '';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SuccessStory'
      AND column_name = 'storyType'
      AND udt_name <> 'StoryType'
  ) THEN
    ALTER TABLE "SuccessStory" ALTER COLUMN "storyType" DROP DEFAULT;
    ALTER TABLE "SuccessStory"
      ALTER COLUMN "storyType" TYPE "StoryType"
      USING (
        CASE lower("storyType")
          WHEN 'employer' THEN 'EMPLOYER'::"StoryType"
          WHEN 'training' THEN 'TRAINING'::"StoryType"
          WHEN 'ethical_recruitment' THEN 'ETHICAL_RECRUITMENT'::"StoryType"
          ELSE 'CANDIDATE'::"StoryType"
        END
      );
    ALTER TABLE "SuccessStory" ALTER COLUMN "storyType" SET DEFAULT 'CANDIDATE';
  END IF;
END $$;

ALTER TABLE "SuccessStory"
  DROP COLUMN IF EXISTS "consentGiven",
  DROP COLUMN IF EXISTS "image",
  DROP COLUMN IF EXISTS "isPublished";

CREATE TABLE IF NOT EXISTS "ApplicationDocumentRequirement" (
    "id" TEXT NOT NULL,
    "demandId" TEXT,
    "positionId" TEXT,
    "documentType" "DocumentType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "maxSizeMb" INTEGER NOT NULL DEFAULT 5,
    "allowedMimeTypes" TEXT NOT NULL,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ApplicationDocumentRequirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CareerApplication" (
    "id" TEXT NOT NULL,
    "careerOpeningId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminNotes" TEXT,
    "hashedIp" TEXT,
    "hashedUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerApplication_pkey" PRIMARY KEY ("id")
);

DROP INDEX IF EXISTS "InsightArticle_isPublished_idx";
DROP INDEX IF EXISTS "SEOPageMeta_pagePath_key";
DROP INDEX IF EXISTS "SuccessStory_isPublished_idx";

CREATE INDEX IF NOT EXISTS "ApplicationDocumentRequirement_demandId_idx" ON "ApplicationDocumentRequirement"("demandId");
CREATE INDEX IF NOT EXISTS "ApplicationDocumentRequirement_positionId_idx" ON "ApplicationDocumentRequirement"("positionId");
CREATE INDEX IF NOT EXISTS "CareerApplication_careerOpeningId_idx" ON "CareerApplication"("careerOpeningId");
CREATE INDEX IF NOT EXISTS "CareerApplication_status_idx" ON "CareerApplication"("status");
CREATE INDEX IF NOT EXISTS "CareerApplication_email_idx" ON "CareerApplication"("email");
CREATE INDEX IF NOT EXISTS "InsightArticle_status_idx" ON "InsightArticle"("status");
CREATE INDEX IF NOT EXISTS "SEOPageMeta_lang_idx" ON "SEOPageMeta"("lang");
CREATE UNIQUE INDEX IF NOT EXISTS "SEOPageMeta_pagePath_lang_key" ON "SEOPageMeta"("pagePath", "lang");
CREATE INDEX IF NOT EXISTS "SuccessStory_storyType_idx" ON "SuccessStory"("storyType");
CREATE INDEX IF NOT EXISTS "SuccessStory_status_idx" ON "SuccessStory"("status");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationDocumentRequirement_demandId_fkey') THEN
    ALTER TABLE "ApplicationDocumentRequirement"
      ADD CONSTRAINT "ApplicationDocumentRequirement_demandId_fkey"
      FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationDocumentRequirement_positionId_fkey') THEN
    ALTER TABLE "ApplicationDocumentRequirement"
      ADD CONSTRAINT "ApplicationDocumentRequirement_positionId_fkey"
      FOREIGN KEY ("positionId") REFERENCES "DemandPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SuccessStory_featuredImageId_fkey') THEN
    ALTER TABLE "SuccessStory"
      ADD CONSTRAINT "SuccessStory_featuredImageId_fkey"
      FOREIGN KEY ("featuredImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InsightArticle_featuredImageId_fkey') THEN
    ALTER TABLE "InsightArticle"
      ADD CONSTRAINT "InsightArticle_featuredImageId_fkey"
      FOREIGN KEY ("featuredImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CareerApplication_careerOpeningId_fkey') THEN
    ALTER TABLE "CareerApplication"
      ADD CONSTRAINT "CareerApplication_careerOpeningId_fkey"
      FOREIGN KEY ("careerOpeningId") REFERENCES "CareerOpening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
