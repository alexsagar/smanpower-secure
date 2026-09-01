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
  const clientPartnerLogos = await prisma.clientPartner.count({ where: { logoUrl: { contains: 'res.cloudinary.com' } } });
  const complianceDocs = await prisma.complianceDocument.count({ where: { fileUrl: { contains: 'res.cloudinary.com' } } });
  
  console.log(`Total MediaAsset: ${allMedia}`);
  console.log(`CLOUDINARY MediaAsset: ${cloudinaryMedia}`);
  console.log(`R2 MediaAsset: ${r2Media}`);
  console.log(`storageKey Populated: ${storageKeys}`);
  console.log(`ClientPartner Cloudinary URLs: ${clientPartnerLogos}`);
  console.log(`ComplianceDocument Cloudinary URLs: ${complianceDocs}`);
  process.exit(0);
})();
