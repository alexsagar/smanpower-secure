const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function getStats(url, envName) {
  const endpoint = url.split('@')[1].split('.')[0];
  console.log(`\n=== ${envName} (${endpoint}) ===`);
  const prisma = new PrismaClient({ datasourceUrl: url });
  
  try {
    const assets = await prisma.mediaAsset.findMany();
    const total = assets.length;
    const r2 = assets.filter(a => a.provider === 'R2').length;
    const cloudinary = assets.filter(a => a.provider === 'CLOUDINARY').length;
    const withKey = assets.filter(a => a.storageKey).length;
    
    console.log(`MediaAsset Total: ${total}`);
    console.log(`R2: ${r2} | CLOUDINARY: ${cloudinary}`);
    console.log(`StorageKey populated: ${withKey}`);
    
    const partners = await prisma.clientPartner.findMany();
    const partnerUrlCount = partners.filter(p => p.logoUrl && p.logoUrl.includes('cloudinary')).length;
    console.log(`ClientPartner Total: ${partners.length} | Cloudinary URLs: ${partnerUrlCount}`);
    
    const docs = await prisma.complianceDocument.findMany();
    const docUrlCount = docs.filter(d => d.fileUrl && d.fileUrl.includes('cloudinary')).length;
    console.log(`ComplianceDocument Total: ${docs.length} | Cloudinary URLs: ${docUrlCount}`);
    
    const candidates = await prisma.candidateDocument.findMany();
    console.log(`CandidateDocument Total: ${candidates.length}`);
    
    return { assets, partners, docs };
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  const prodUrl = process.env.URL_PROD;
  const devUrl = process.env.URL_LOCAL;
  
  const prodStats = await getStats(prodUrl, 'PRODUCTION');
  const devStats = await getStats(devUrl, 'DEVELOPMENT');
  
  // Diff 135 vs 139
  console.log('\n=== DIFF ===');
  const prodIds = new Set(prodStats.assets.map(a => a.id));
  const devOnly = devStats.assets.filter(a => !prodIds.has(a.id));
  
  console.log(`Assets in DEV but not PROD (${devOnly.length}):`);
  devOnly.forEach(a => console.log(`- ${a.id}: ${a.publicId} (${a.resourceType}, ${a.usage})`));
  
  const devIds = new Set(devStats.assets.map(a => a.id));
  const prodOnly = prodStats.assets.filter(a => !devIds.has(a.id));
  console.log(`Assets in PROD but not DEV (${prodOnly.length}):`);
  prodOnly.forEach(a => console.log(`- ${a.id}: ${a.publicId} (${a.resourceType}, ${a.usage})`));
})();
