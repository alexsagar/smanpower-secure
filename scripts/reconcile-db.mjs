import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient();
(async () => {
  const allMedia = await prisma.mediaAsset.count();
  const cloudinaryMedia = await prisma.mediaAsset.count({ where: { provider: 'CLOUDINARY' } });
  const r2Media = await prisma.mediaAsset.count({ where: { provider: 'R2' } });
  const storageKeys = await prisma.mediaAsset.count({ where: { storageKey: { not: null } } });
  
  const cloudinaryWithStorage = await prisma.mediaAsset.count({ where: { provider: 'CLOUDINARY', storageKey: { not: null } } });
  const r2WithoutStorage = await prisma.mediaAsset.count({ where: { provider: 'R2', storageKey: null } });

  console.log(`Total MediaAsset: ${allMedia}`);
  console.log(`CLOUDINARY MediaAsset: ${cloudinaryMedia}`);
  console.log(`R2 MediaAsset: ${r2Media}`);
  console.log(`storageKey Populated: ${storageKeys}`);
  console.log(`CLOUDINARY with storageKey: ${cloudinaryWithStorage}`);
  console.log(`R2 without storageKey: ${r2WithoutStorage}`);
  
  if (cloudinaryWithStorage > 0) {
    const mixed = await prisma.mediaAsset.findMany({ where: { provider: 'CLOUDINARY', storageKey: { not: null } } });
    console.log("CLOUDINARY rows with storageKey:", JSON.stringify(mixed, null, 2));
  }
  
  process.exit(0);
})();
