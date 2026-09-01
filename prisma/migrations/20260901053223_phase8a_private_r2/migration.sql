-- CreateEnum
CREATE TYPE "PrivateStorageProvider" AS ENUM ('LOCAL', 'R2_PRIVATE');

-- AlterTable
ALTER TABLE "CandidateDocument" ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "storageProvider" "PrivateStorageProvider" NOT NULL DEFAULT 'LOCAL';
