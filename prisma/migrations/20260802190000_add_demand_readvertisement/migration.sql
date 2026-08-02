-- AlterTable
ALTER TABLE "Demand" ADD COLUMN     "readvertisedFromId" TEXT;

-- CreateIndex
CREATE INDEX "Demand_readvertisedFromId_idx" ON "Demand"("readvertisedFromId");

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_readvertisedFromId_fkey" FOREIGN KEY ("readvertisedFromId") REFERENCES "Demand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
