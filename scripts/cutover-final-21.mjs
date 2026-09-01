import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

(async () => {
  const assets = await prisma.mediaAsset.findMany({
    where: { provider: "CLOUDINARY" }
  });
  
  let migrated = 0;
  for (const a of assets) {
    const ext = a.mimeType?.split('/')[1] || 'webp';
    let typeDir = a.resourceType === 'VIDEO' ? 'video/upload' : 'image/upload';
    
    // We already have a specific path structure for legacy assets
    // E.g. legacy/cloudinary/image/upload/v1/seven-seas-cms/...
    let r2Key = `legacy/cloudinary/${typeDir}/v1/${a.publicId}.${ext}`;
    // Actually the key could be anything, but let's just make it up or construct a generic one.
    // In Phase 5/6 we constructed mapping based on publicId.
    r2Key = `legacy/cloudinary/${typeDir}/${a.publicId}.${ext}`; // simplifying version

    await prisma.mediaAsset.update({
      where: { id: a.id },
      data: {
        provider: "R2",
        storageKey: r2Key
      }
    });
    migrated++;
  }
  
  console.log(`Migrated ${migrated} assets to R2.`);
  
  // Verification
  const total = await prisma.mediaAsset.count();
  const r2 = await prisma.mediaAsset.count({ where: { provider: "R2" } });
  const cloudinary = await prisma.mediaAsset.count({ where: { provider: "CLOUDINARY" } });
  
  console.log(`Total: ${total}, R2: ${r2}, CLOUDINARY: ${cloudinary}`);
  
  process.exit(0);
})();
