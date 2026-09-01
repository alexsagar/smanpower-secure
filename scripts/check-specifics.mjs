import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient();
(async () => {
  const video = await prisma.mediaAsset.findFirst({ where: { publicId: 'seven-seas-cms/s6gzjlbemd66efyapcex' } });
  console.log("Homepage Video Record:", JSON.stringify(video, null, 2));
  
  const partners = await prisma.clientPartner.count({ where: { logoUrl: { contains: 'res.cloudinary.com' } } });
  const docs = await prisma.complianceDocument.count({ where: { fileUrl: { contains: 'res.cloudinary.com' } } });
  
  console.log(`ClientPartner Cloudinary URLs: ${partners}`);
  console.log(`ComplianceDocument Cloudinary URLs: ${docs}`);

  process.exit(0);
})();
