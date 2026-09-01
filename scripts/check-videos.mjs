import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient();
(async () => {
  const videos = await prisma.mediaAsset.findMany({ where: { resourceType: 'VIDEO' } });
  console.log("Videos:", JSON.stringify(videos, null, 2));
  process.exit(0);
})();
