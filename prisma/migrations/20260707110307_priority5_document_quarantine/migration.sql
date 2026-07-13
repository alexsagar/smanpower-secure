-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING_SCAN', 'SCANNING', 'SAFE', 'REJECTED', 'SCAN_FAILED');

-- AlterTable
ALTER TABLE "CandidateDocument" ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING_SCAN';
