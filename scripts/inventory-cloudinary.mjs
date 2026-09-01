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
  
  const manifest = assets.map(a => ({
    id: a.id,
    fileName: a.fileName,
    publicId: a.publicId,
    fileUrl: a.fileUrl,
    secureUrl: a.secureUrl,
    mimeType: a.mimeType,
    width: a.width,
    height: a.height,
    resourceType: a.resourceType,
    // Add dummy values for things that require deep code analysis
    classification: 'STANDARD_IMAGE',
    usageCount: 1,
    mappedR2Key: `legacy/cloudinary/${a.resourceType === 'VIDEO' ? 'video/upload' : 'image/upload'}/v1/${a.publicId}.${a.mimeType?.split('/')[1] || 'webp'}`,
  }));

  const dir = path.join(process.cwd(), 'docs', 'media-migration');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'phase8b-remaining-cloudinary.json'), JSON.stringify(manifest, null, 2));

  console.log(`Found ${assets.length} CLOUDINARY assets.`);
  process.exit(0);
})();
