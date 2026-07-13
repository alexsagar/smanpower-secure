-- DropIndex
DROP INDEX "MfaChallenge_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "MfaChallenge_userId_key" ON "MfaChallenge"("userId");

