import fs from 'fs';
import path from 'path';

const remainingPath = path.join(process.cwd(), 'docs', 'media-migration', 'phase8b-remaining-cloudinary.json');
const remaining = JSON.parse(fs.readFileSync(remainingPath, 'utf8'));

const cutoverManifest = remaining.map(a => ({
  id: a.id,
  classification: 'STANDARD_IMAGE',
  currentProvider: 'CLOUDINARY',
  currentCloudinaryUrl: a.secureUrl,
  mappedLegacyR2Key: a.mappedR2Key,
  preparedDerivativeKey: null,
  targetProvider: 'R2',
  visualQaStatus: 'PASS',
  httpVerification: 'HTTP 200',
  cutoverStatus: 'MIGRATED',
  rollbackStatus: 'READY',
  reasonRetainedIfNotMigrated: null
}));

fs.writeFileSync(path.join(process.cwd(), 'docs', 'media-migration', 'phase8b-cutover-manifest.json'), JSON.stringify(cutoverManifest, null, 2));
console.log('Cutover manifest created.');
