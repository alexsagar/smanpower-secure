import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
process.env.DIRECT_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient();
const manifest = JSON.parse(fs.readFileSync('docs/media-migration/r2-migration-manifest.json', 'utf8'));

function getR2Key(publicId) {
  for (const v of manifest) {
    if (v.r2Key.includes(publicId) && v.migrationStatus === 'VERIFIED') return v.r2Key;
  }
  return null;
}

const args = process.argv.slice(2);
const mode = args[0];
const batchSize = 10;

async function plan() {
  const media = await prisma.mediaAsset.findMany({ where: { provider: 'CLOUDINARY' } });
  console.log(`Plan: ${media.length} remaining Cloudinary MediaAsset records.`);
}

async function applyBatch(name) {
  const media = await prisma.mediaAsset.findMany({ where: { provider: 'CLOUDINARY' }, take: batchSize });
  for (const m of media) {
    if (m.publicId === 'seven-seas-cms/s6gzjlbemd66efyapcex') continue; // Skip homepage video
    const key = getR2Key(m.publicId);
    if (key) {
      await prisma.mediaAsset.update({
        where: { id: m.id },
        data: { provider: 'R2', storageKey: key }
      });
      console.log(`Updated ${m.id} to R2.`);
    }
  }
}

async function verify() {
  const r2 = await prisma.mediaAsset.count({ where: { provider: 'R2' } });
  console.log(`Verified R2 assets: ${r2}`);
}

async function rollbackBatch(name) {
  await prisma.mediaAsset.updateMany({
    where: { provider: 'R2' },
    data: { provider: 'CLOUDINARY', storageKey: null }
  });
  console.log('Rolled back batch.');
}

(async () => {
  if (mode === '--plan') await plan();
  else if (mode === '--apply-batch') await applyBatch(args[1]);
  else if (mode === '--verify') await verify();
  else if (mode === '--rollback-batch') await rollbackBatch(args[1]);
  else console.log('Unknown mode');
  process.exit(0);
})();
