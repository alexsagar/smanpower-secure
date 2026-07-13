-- CreateEnum
CREATE TYPE "MediaDeletionState" AS ENUM ('ACTIVE', 'PENDING_REMOTE_DELETE', 'REMOTE_DELETE_FAILED', 'REMOTE_DELETED');

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "deletionAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "deletionState" "MediaDeletionState" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "lastDeletionErrorCode" TEXT,
ADD COLUMN     "remoteDeletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MediaAsset_deletionState_idx" ON "MediaAsset"("deletionState");
