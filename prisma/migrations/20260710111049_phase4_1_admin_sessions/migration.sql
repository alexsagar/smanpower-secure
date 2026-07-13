-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "sessionIdHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionVersionAtIssue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idleExpiresAt" TIMESTAMP(3) NOT NULL,
    "absoluteExpiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "ipAddressHash" TEXT,
    "userAgentHash" TEXT,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_sessionIdHash_key" ON "AdminSession"("sessionIdHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_idleExpiresAt_idx" ON "AdminSession"("idleExpiresAt");

-- CreateIndex
CREATE INDEX "AdminSession_absoluteExpiresAt_idx" ON "AdminSession"("absoluteExpiresAt");

-- CreateIndex
CREATE INDEX "AdminSession_revokedAt_idx" ON "AdminSession"("revokedAt");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
