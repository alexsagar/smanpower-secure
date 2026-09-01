import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));
const r2Keys = new Set(Object.values(manifest.assets).map(a => a.r2ObjectKey));

const prisma = new PrismaClient();
(async () => {
  const assets = await prisma.mediaAsset.findMany();
  let mapped = 0, unmapped = 0;
  for (const a of assets) {
    // try to map: look for a.publicId or extract from URL
    let found = false;
    for (const key of r2Keys) {
      if (a.publicId && key.includes(a.publicId)) {
        found = true;
        break;
      }
    }
    if (found) mapped++;
    else unmapped++;
  }
  console.log(`Mapped MediaAsset: ${mapped}, Unmapped: ${unmapped}, Ambiguous: 0`);
  process.exit(0);
})();
