import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const mediaCount = await prisma.mediaAsset.count();
  const cpCount = await prisma.clientPartner.count({ where: { logoUrl: { not: null } } });
  const cdCount = await prisma.complianceDocument.count({ where: { fileUrl: { not: null } } });
  console.log('MediaAsset Count:', mediaCount);
  console.log('ClientPartner logoUrl Count:', cpCount);
  console.log('ComplianceDocument fileUrl Count:', cdCount);
  const firstFew = await prisma.mediaAsset.findMany({ take: 3, select: { fileUrl: true } });
  console.log('Sample fileUrls:', firstFew.map(m => m.fileUrl).join(', '));
  process.exit(0);
})();
