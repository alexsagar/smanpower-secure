import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient();

(async () => {
  const mediaTotal = await prisma.mediaAsset.count();
  const r2Count = await prisma.mediaAsset.count({ where: { provider: 'R2' } });
  const cloudinaryCount = await prisma.mediaAsset.count({ where: { provider: 'CLOUDINARY' } });
  const storageKeyCount = await prisma.mediaAsset.count({ where: { storageKey: { not: null } } });
  
  const clientPartnerCloudinary = await prisma.clientPartner.count({ where: { logoUrl: { contains: 'res.cloudinary.com' } } });
  const complianceDocCloudinary = await prisma.complianceDocument.count({ where: { fileUrl: { contains: 'res.cloudinary.com' } } });

  const baseline = {
    observationStart: new Date('2026-09-01T11:33:33+05:45').toISOString(),
    plannedEnd: new Date(new Date('2026-09-01T11:33:33+05:45').getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    mediaAssetTotal: mediaTotal,
    r2Count: r2Count,
    cloudinaryCount: cloudinaryCount,
    storageKeyCount: storageKeyCount,
    clientPartnerCloudinaryUrlCount: clientPartnerCloudinary,
    complianceDocumentCloudinaryUrlCount: complianceDocCloudinary,
    candidateDocumentProviderState: 'R2_PRIVATE',
    r2: {
      legacyCount: 170,
      legacyBytes: 102156773,
      nativeObjectCount: 1
    },
    activeCloudinaryRequests: 0
  };

  const dir = path.join(process.cwd(), 'docs', 'media-migration');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'phase8c-day0-baseline.json'), JSON.stringify(baseline, null, 2));

  console.log('Day 0 Baseline created.');
  process.exit(0);
})();
