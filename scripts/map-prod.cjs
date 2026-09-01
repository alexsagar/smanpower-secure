const fs = require('fs');

const manifestPath = 'docs/media-migration/r2-migration-manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Build lookup map by publicId
const manifestMap = new Map();
manifest.forEach(item => {
  manifestMap.set(item.cloudinaryPublicId, item);
});

const backupFiles = fs.readdirSync('docs/media-migration/backups').filter(f => f.startsWith('phase6p'));
const latestBackup = 'docs/media-migration/backups/' + backupFiles.sort().reverse()[0];
const prodData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));

let mapped = 0;
let unmapped = 0;
let ambiguous = 0;
const cutoverMapping = [];

for (const asset of prodData.assets) {
  const item = manifestMap.get(asset.publicId);
  if (!item) {
    console.log(`UNMAPPED: ${asset.publicId} (ID: ${asset.id})`);
    unmapped++;
  } else if (!item.r2Key) {
    console.log(`AMBIGUOUS: ${asset.publicId} (ID: ${asset.id}) - No R2 key`);
    ambiguous++;
  } else {
    cutoverMapping.push({
      id: asset.id,
      publicId: asset.publicId,
      r2Key: item.r2Key,
      r2Url: item.r2Url
    });
    mapped++;
  }
}

console.log(`\nMediaAsset mapping complete:`);
console.log(`Total: ${prodData.assets.length} | Mapped: ${mapped} | Unmapped: ${unmapped} | Ambiguous: ${ambiguous}`);

fs.writeFileSync('docs/media-migration/backups/phase6p-cutover-mapping.json', JSON.stringify(cutoverMapping, null, 2));

