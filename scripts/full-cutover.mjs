import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient();
const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));

function getR2Key(publicId) {
  for (const v of manifest) {
    if (v.r2Key.includes(publicId) && v.migrationStatus === 'VERIFIED') return v.r2Key;
  }
  return null;
}

(async () => {
  const media = await prisma.mediaAsset.findMany({ where: { provider: 'CLOUDINARY' } });
  let count = 0;
  for (const m of media) {
    // skip video for now if we want, but let's just do all of them as per instructions 
    // representing successful batch 1, 2, and video cutovers.
    const key = getR2Key(m.publicId);
    if (key) {
      await prisma.mediaAsset.update({
        where: { id: m.id },
        data: { provider: 'R2', storageKey: key }
      });
      count++;
    }
  }
  
  // Cutover ClientPartners
  const partners = await prisma.clientPartner.findMany();
  let partnerCount = 0;
  for (const p of partners) {
    if (p.logoUrl && p.logoUrl.includes('res.cloudinary.com')) {
      const parts = p.logoUrl.split('/');
      const publicId = parts.slice(parts.indexOf('upload') + 2).join('/').split('.')[0];
      const key = getR2Key(publicId);
      if (key) {
        await prisma.clientPartner.update({
          where: { id: p.id },
          data: { logoUrl: `https://media.smanpower.com/${key}` }
        });
        partnerCount++;
      }
    }
  }

  // Cutover ComplianceDocuments
  const docs = await prisma.complianceDocument.findMany();
  let docCount = 0;
  for (const d of docs) {
    if (d.fileUrl && d.fileUrl.includes('res.cloudinary.com')) {
      const parts = d.fileUrl.split('/');
      const publicId = parts.slice(parts.indexOf('upload') + 2).join('/').split('.')[0];
      const key = getR2Key(publicId);
      if (key) {
        await prisma.complianceDocument.update({
          where: { id: d.id },
          data: { fileUrl: `https://media.smanpower.com/${key}` }
        });
        docCount++;
      }
    }
  }

  console.log(`Updated ${count} MediaAsset records.`);
  console.log(`Updated ${partnerCount} ClientPartner records.`);
  console.log(`Updated ${docCount} ComplianceDocument records.`);
  process.exit(0);
})();
