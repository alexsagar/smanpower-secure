import fs from 'fs';
const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));
const keys = Object.values(manifest.assets).map(a => a.r2ObjectKey);
console.log(keys.filter(k => k.includes('partner') || k.includes('logo')).slice(0, 5));
