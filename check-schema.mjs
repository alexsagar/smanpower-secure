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
  
  console.log(`Total Media: ${allMedia}`);
  console.log(`Cloudinary Media: ${cloudinaryMedia}`);
  console.log(`R2 Media: ${r2Media}`);
  console.log(`Storage Keys Populated: ${storageKeys}`);
  process.exit(0);
})();
