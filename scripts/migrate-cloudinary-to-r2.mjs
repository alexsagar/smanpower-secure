import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG } from './r2-client.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INVENTORY_PATH = path.join(__dirname, '..', 'docs', 'media-migration', 'cloudinary-inventory.json');
const MANIFEST_PATH = path.join(__dirname, '..', 'docs', 'media-migration', 'r2-migration-manifest.json');
const REF_MAP_PATH = path.join(__dirname, '..', 'docs', 'media-migration', 'cloudinary-reference-map.csv');

export function generateR2Key(asset) {
  const resourceType = (asset.resource_type || asset.cloudinaryResourceType || 'image').toLowerCase();
  let publicId = asset.public_id || asset.cloudinaryPublicId || '';

  publicId = publicId.replace(/\.\./g, '').replace(/^[/\\]+/, '');

  let format = (asset.format || asset.cloudinaryFormat || '').toLowerCase();
  if (format && publicId.toLowerCase().endsWith('.' + format)) {
    publicId = publicId.slice(0, -(format.length + 1));
  }

  const extension = format ? `.${format}` : '';
  return `legacy/cloudinary/${resourceType}/${publicId}${extension}`;
}

export function resolveContentType(asset) {
  const format = (asset.format || asset.cloudinaryFormat || '').toLowerCase();
  const resourceType = (asset.resource_type || asset.cloudinaryResourceType || 'image').toLowerCase();

  if (format === 'pdf') {
    return 'application/pdf';
  }
  if (format === 'jpg' || format === 'jpeg') {
    return 'image/jpeg';
  }
  if (format === 'png') {
    return 'image/png';
  }
  if (format === 'webp') {
    return 'image/webp';
  }
  if (format === 'mp4') {
    return 'video/mp4';
  }
  if (format === 'webm') {
    return 'video/webm';
  }
  if (format === 'svg') {
    return 'image/svg+xml';
  }
  if (resourceType === 'video') {
    return `video/${format || 'mp4'}`;
  }
  return `image/${format || 'jpeg'}`;
}

export function isOriginalCloudinaryUrl(url) {
  if (!url) return false;
  const transformationMarkers = [
    '/c_fill', '/c_limit', '/c_fit', '/c_scale', '/c_crop', '/c_pad',
    '/q_auto', '/f_auto', '/w_', '/h_', '/so_auto', '/e_trim', '/fl_'
  ];
  return !transformationMarkers.some(marker => url.includes(marker));
}

function fetchBuffer(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location, options));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function computeSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function initializeManifest() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    throw new Error(`Inventory file not found at: ${INVENTORY_PATH}`);
  }

  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));

  const dbRefMap = new Map();
  if (fs.existsSync(REF_MAP_PATH)) {
    const csvContent = fs.readFileSync(REF_MAP_PATH, 'utf8');
    const lines = csvContent.split('\n').slice(1);
    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(',');
      if (parts.length >= 6) {
        const publicId = parts[0].replace(/^"|"$/g, '');
        const usages = parts[5].replace(/^"|"$/g, '');
        if (usages) {
          dbRefMap.set(publicId, usages.split('; '));
        }
      }
    });
  }

  let existingManifestMap = new Map();
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const existingManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      existingManifest.forEach(m => existingManifestMap.set(m.cloudinaryPublicId, m));
    } catch {}
  }

  const manifest = inventory.map(asset => {
    const existing = existingManifestMap.get(asset.public_id);
    if (existing && existing.verificationStatus === 'VERIFIED') {
      return existing;
    }

    const r2Key = generateR2Key(asset);
    const r2Url = `https://${R2_CONFIG.publicDomain}/${r2Key}`;

    return {
      cloudinaryAssetId: asset.asset_id || '',
      cloudinaryPublicId: asset.public_id,
      cloudinaryResourceType: asset.resource_type,
      cloudinaryFormat: asset.format,
      cloudinaryUrl: asset.secure_url,
      r2Key,
      r2Url,
      bytesSource: asset.bytes,
      bytesDestination: existing?.bytesDestination || null,
      sourceChecksum: existing?.sourceChecksum || null,
      destinationETag: existing?.destinationETag || null,
      migrationStatus: existing?.migrationStatus || 'PENDING',
      verificationStatus: existing?.verificationStatus || 'PENDING',
      databaseReferences: dbRefMap.get(asset.public_id) || [],
      attempts: existing?.attempts || 0,
      error: null,
      migrationTimestamp: existing?.migrationTimestamp || null,
    };
  });

  return manifest;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function migrateAsset(record, maxRetries = 3) {
  // If already verified, skip (idempotent / resume)
  if (record.verificationStatus === 'VERIFIED') {
    return { record, skipped: true };
  }

  record.attempts = (record.attempts || 0) + 1;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Download original from Cloudinary
      const sourceRes = await fetchBuffer(record.cloudinaryUrl);
      if (sourceRes.statusCode !== 200) {
        throw new Error(`Cloudinary source returned HTTP ${sourceRes.statusCode}`);
      }
      if (!sourceRes.body || sourceRes.body.length === 0) {
        throw new Error('Cloudinary source returned zero bytes');
      }

      const sourceBuffer = sourceRes.body;
      const sourceSha = computeSha256(sourceBuffer);
      record.sourceChecksum = sourceSha;
      record.bytesSource = sourceBuffer.length;

      const contentType = resolveContentType(record);

      // 2. Upload to R2
      const putRes = await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: record.r2Key,
          Body: sourceBuffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );
      record.destinationETag = putRes.ETag ? putRes.ETag.replace(/"/g, '') : null;

      // 3. Cryptographic Verification: Get Object back via S3 API
      const getObjRes = await r2Client.send(
        new GetObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: record.r2Key,
        })
      );
      const destChunks = [];
      for await (const chunk of getObjRes.Body) {
        destChunks.push(chunk);
      }
      const destBuffer = Buffer.concat(destChunks);
      const destSha = computeSha256(destBuffer);

      if (sourceSha !== destSha) {
        throw new Error(`Checksum mismatch: source(${sourceSha}) != dest(${destSha})`);
      }

      // 4. HeadObject verification
      const headRes = await r2Client.send(
        new HeadObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: record.r2Key,
        })
      );
      if (headRes.ContentLength !== sourceBuffer.length) {
        throw new Error(`Size mismatch: source(${sourceBuffer.length}) != head(${headRes.ContentLength})`);
      }
      record.bytesDestination = headRes.ContentLength;

      // 5. Public Custom Domain GET verification
      const publicRes = await fetchBuffer(record.r2Url);
      if (publicRes.statusCode !== 200) {
        throw new Error(`Public custom domain returned HTTP ${publicRes.statusCode}`);
      }
      if (publicRes.body.length !== sourceBuffer.length) {
        throw new Error(`Public custom domain body length mismatch: ${publicRes.body.length} != ${sourceBuffer.length}`);
      }

      // 6. Special Range verification for video
      if (record.cloudinaryResourceType === 'video') {
        const rangeRes = await fetchBuffer(record.r2Url, {
          headers: { Range: 'bytes=0-99' },
        });
        if (rangeRes.statusCode !== 206) {
          throw new Error(`Video Range request returned HTTP ${rangeRes.statusCode} instead of 206`);
        }
      }

      // 7. Special PDF verification
      if (record.cloudinaryFormat === 'pdf') {
        if (!publicRes.headers['content-type']?.includes('application/pdf')) {
          throw new Error(`PDF custom domain Content-Type is ${publicRes.headers['content-type']}, expected application/pdf`);
        }
      }

      record.migrationStatus = 'VERIFIED';
      record.verificationStatus = 'VERIFIED';
      record.error = null;
      record.migrationTimestamp = new Date().toISOString();

      return { record, success: true };
    } catch (err) {
      record.error = err.message;
      if (attempt < maxRetries) {
        await sleep(1000 * Math.pow(2, attempt));
      } else {
        record.migrationStatus = 'FAILED';
        record.verificationStatus = 'FAILED';
        return { record, success: false, error: err.message };
      }
    }
  }
}

async function executeMigration(manifest) {
  console.log('=== EXECUTING CLOUDINARY -> R2 MIGRATION & VERIFICATION ===\n');
  console.log(`Total records in manifest: ${manifest.length}`);

  const CONCURRENCY = 4;
  let inProgress = 0;
  let completed = 0;
  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  const queue = [...manifest];
  const saveInterval = 10;
  let sinceLastSave = 0;

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const res = await migrateAsset(item);
      completed++;
      sinceLastSave++;

      if (res.skipped) {
        skipped++;
        console.log(`[${completed}/${manifest.length}] SKIPPED (Already verified): ${item.r2Key}`);
      } else if (res.success) {
        succeeded++;
        console.log(`[${completed}/${manifest.length}] VERIFIED (${item.bytesSource} B): ${item.r2Key}`);
      } else {
        failed++;
        console.error(`[${completed}/${manifest.length}] FAILED: ${item.r2Key} - ${res.error}`);
      }

      if (sinceLastSave >= saveInterval || completed === manifest.length) {
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        sinceLastSave = 0;
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('\n=== MIGRATION RUN SUMMARY ===');
  console.log(`Total: ${manifest.length}`);
  console.log(`Verified new: ${succeeded}`);
  console.log(`Skipped (already verified): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

export function runDryRun(manifest) {
  console.log('=== RUNNING MIGRATION DRY RUN ===\n');
  console.log(`Total inventory records loaded: ${manifest.length}`);

  let totalBytes = 0;
  const keySet = new Set();
  const collisions = [];
  const transformedUrls = [];

  manifest.forEach(record => {
    totalBytes += record.bytesSource || 0;

    if (keySet.has(record.r2Key)) {
      collisions.push(record.r2Key);
    } else {
      keySet.add(record.r2Key);
    }

    if (!isOriginalCloudinaryUrl(record.cloudinaryUrl)) {
      transformedUrls.push(record.cloudinaryUrl);
    }
  });

  console.log(`Unique R2 keys generated: ${keySet.size}`);
  console.log(`Total expected payload: ${totalBytes} bytes (${(totalBytes / (1024 * 1024 * 1024)).toFixed(4)} GB / ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);

  const homeVideo = manifest.find(m => m.cloudinaryPublicId === 'staging/seven-seas-cms/s6gzjlbemd66efyapcex');
  console.log('\nSpecial Case - Homepage Video:');
  if (homeVideo) {
    console.log(`  Source Public ID: ${homeVideo.cloudinaryPublicId}`);
    console.log(`  Target R2 Key:    ${homeVideo.r2Key}`);
    console.log(`  Expected:         legacy/cloudinary/video/staging/seven-seas-cms/s6gzjlbemd66efyapcex.mp4`);
    console.log(`  Match:            ${homeVideo.r2Key === 'legacy/cloudinary/video/staging/seven-seas-cms/s6gzjlbemd66efyapcex.mp4' ? 'YES (PASSED)' : 'NO (FAILED)'}`);
  }

  const pdfLicense = manifest.find(m => m.cloudinaryPublicId === 'SSIS_License_of_Foreign_Employment_xwnjyf');
  console.log('\nSpecial Case - PDF Licence Document:');
  if (pdfLicense) {
    console.log(`  Source Public ID: ${pdfLicense.cloudinaryPublicId}`);
    console.log(`  Target R2 Key:    ${pdfLicense.r2Key}`);
    console.log(`  Resolved MIME:    ${resolveContentType(pdfLicense)}`);
    console.log(`  Expected MIME:    application/pdf`);
    console.log(`  Match:            ${resolveContentType(pdfLicense) === 'application/pdf' ? 'YES (PASSED)' : 'NO (FAILED)'}`);
  }

  console.log('\nCollision Check:');
  if (collisions.length === 0) {
    console.log('  ZERO collisions detected across all 170 assets! (PASSED)');
  } else {
    console.error(`  CRITICAL: ${collisions.length} collisions detected:`, collisions);
  }

  console.log('\nOriginal URL Check:');
  if (transformedUrls.length === 0) {
    console.log('  All 170 asset URLs are pure original masters without Cloudinary transformations. (PASSED)');
  } else {
    console.error(`  CRITICAL: Found transformed URLs in inventory:`, transformedUrls);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nSaved migration manifest to: docs/media-migration/r2-migration-manifest.json`);
  console.log('\n[DRY RUN COMPLETE — ZERO DATA MODIFIED]');
}

// CLI Execution
const args = process.argv.slice(2);
const isExecute = args.includes('--execute');
const isDryRun = args.includes('--dry-run') || (!isExecute && args.length === 0);

const manifest = initializeManifest();
if (isExecute) {
  await executeMigration(manifest);
} else if (isDryRun) {
  runDryRun(manifest);
}
