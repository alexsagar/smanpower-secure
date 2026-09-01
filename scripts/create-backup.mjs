import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));

// Helper to find mapped R2 key by trying to match publicId
function findR2Key(publicId) {
  if (!publicId) return null;
  for (const v of manifest) {
    if (v.r2Key.includes(publicId)) {
      return v.r2Key;
    }
  }
  return null;
}

const prisma = new PrismaClient();

(async () => {
  const media = await prisma.mediaAsset.findMany();
  const partners = await prisma.clientPartner.findMany();
  const docs = await prisma.complianceDocument.findMany();

  const backup = {
    timestamp: new Date().toISOString(),
    mediaAssets: media.map(m => {
      const r2Key = findR2Key(m.publicId) || m.storageKey || null;
      return {
        id: m.id,
        provider: m.provider,
        storageKey: m.storageKey,
        fileUrl: m.fileUrl,
        secureUrl: m.fileUrl,
        publicId: m.publicId,
        resourceType: m.resourceType,
        mappedR2Key: r2Key,
        mappedR2Url: r2Key ? `https://media.smanpower.com/${r2Key}` : null
      };
    }),
    clientPartners: partners.filter(p => p.logoUrl && p.logoUrl.includes('res.cloudinary.com')).map(p => {
       return {
         id: p.id,
         currentLogoUrl: p.logoUrl,
         futureR2Url: null
       }
    }),
    complianceDocuments: docs.filter(d => d.fileUrl && d.fileUrl.includes('res.cloudinary.com')).map(d => {
       return {
         id: d.id,
         currentFileUrl: d.fileUrl,
         futureR2Url: null
       }
    })
  };

  if (!fs.existsSync('docs/media-migration/backups')) {
    fs.mkdirSync('docs/media-migration/backups', { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(`docs/media-migration/backups/phase6-production-pre-cutover-${timestamp}.json`, JSON.stringify(backup, null, 2));
  console.log(`Backup created: phase6-production-pre-cutover-${timestamp}.json`);
  process.exit(0);
})();
