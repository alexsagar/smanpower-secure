const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function backup(url) {
  const prisma = new PrismaClient({ datasourceUrl: url });
  
  try {
    const assets = await prisma.mediaAsset.findMany();
    const partners = await prisma.clientPartner.findMany();
    const docs = await prisma.complianceDocument.findMany();
    
    const backupData = {
      timestamp: new Date().toISOString(),
      assets: assets.map(a => ({
        id: a.id,
        provider: a.provider,
        storageKey: a.storageKey,
        fileUrl: a.fileUrl,
        secureUrl: a.secureUrl,
        publicId: a.publicId
      })),
      partners: partners.map(p => ({
        id: p.id,
        logoUrl: p.logoUrl
      })),
      docs: docs.map(d => ({
        id: d.id,
        fileUrl: d.fileUrl
      }))
    };
    
    if (!fs.existsSync('docs/media-migration/backups')) {
      fs.mkdirSync('docs/media-migration/backups', { recursive: true });
    }
    const filename = `docs/media-migration/backups/phase6p-true-production-pre-cutover-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(backupData, null, 2));
    console.log(`Backup saved to ${filename}`);
  } finally {
    await prisma.$disconnect();
  }
}

backup(process.env.URL_PROD);
