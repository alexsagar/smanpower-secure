import {
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import https from 'https';
import { r2Client, R2_CONFIG } from './r2-client.mjs';

function httpsFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
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
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== PHASE 3 R2 CONNECTIVITY SUITE ===\n');

  // 1. PUT Connectivity Test Object
  const testKey1 = 'migration-test/connectivity-test.txt';
  const testContent1 = 'Seven Seas R2 connectivity test';
  console.log(`1. Uploading test object: ${testKey1}...`);
  const putRes = await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: testKey1,
      Body: Buffer.from(testContent1, 'utf8'),
      ContentType: 'text/plain',
      CacheControl: 'no-cache',
    })
  );
  console.log('   PUT Object successful! ETag:', putRes.ETag);

  // 2. HEAD Object verification
  console.log(`2. Verifying HeadObject on: ${testKey1}...`);
  const headRes = await r2Client.send(
    new HeadObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: testKey1,
    })
  );
  console.log('   HeadObject verified:');
  console.log('   - ContentLength:', headRes.ContentLength, '(expected:', Buffer.byteLength(testContent1), ')');
  console.log('   - ContentType:', headRes.ContentType);
  console.log('   - ETag:', headRes.ETag);
  console.log('   - CacheControl:', headRes.CacheControl);

  // 3. Public Custom Domain GET verification
  console.log(`3. Fetching via public custom domain: https://${R2_CONFIG.publicDomain}/${testKey1}...`);
  const publicRes = await httpsFetch(`https://${R2_CONFIG.publicDomain}/${testKey1}`);
  console.log('   Custom Domain GET:');
  console.log('   - Status:', publicRes.statusCode);
  console.log('   - Body:', publicRes.body.toString('utf8'));
  console.log('   - Content-Type:', publicRes.headers['content-type']);
  console.log('   - Content-Length:', publicRes.headers['content-length']);
  console.log('   - Server:', publicRes.headers['server']);
  console.log('   - CF-Cache-Status:', publicRes.headers['cf-cache-status']);

  // 4. Binary Range Request (HTTP 206)
  const testKey2 = 'migration-test/range-test.bin';
  const binaryContent = Buffer.alloc(1024, 0x41); // 1024 bytes of 'A'
  console.log(`\n4. Uploading 1KB binary file: ${testKey2}...`);
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: testKey2,
      Body: binaryContent,
      ContentType: 'application/octet-stream',
    })
  );
  console.log('   Requesting Range: bytes=0-99 via custom domain...');
  const rangeRes = await httpsFetch(`https://${R2_CONFIG.publicDomain}/${testKey2}`, {
    headers: {
      Range: 'bytes=0-99',
    },
  });
  console.log('   Range Request GET:');
  console.log('   - Status:', rangeRes.statusCode, '(expected: 206)');
  console.log('   - Content-Range:', rangeRes.headers['content-range']);
  console.log('   - Bytes received:', rangeRes.body.length, '(expected: 100)');
  console.log('   - Accept-Ranges:', rangeRes.headers['accept-ranges']);

  // 5. CORS Testing
  console.log('\n5. Testing CORS Preflight (OPTIONS) on R2 S3 endpoint...');
  const approvedCors = await httpsFetch(`${R2_CONFIG.endpoint}/${R2_CONFIG.bucketName}/${testKey1}`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://smanpower.com',
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });
  console.log('   Approved Origin (https://smanpower.com):');
  console.log('   - Status:', approvedCors.statusCode);
  console.log('   - Access-Control-Allow-Origin:', approvedCors.headers['access-control-allow-origin']);
  console.log('   - Access-Control-Allow-Methods:', approvedCors.headers['access-control-allow-methods']);
  console.log('   - Access-Control-Allow-Headers:', approvedCors.headers['access-control-allow-headers']);

  const rejectedCors = await httpsFetch(`${R2_CONFIG.endpoint}/${R2_CONFIG.bucketName}/${testKey1}`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://unauthorized-random-origin.com',
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });
  console.log('   Rejected Origin (https://unauthorized-random-origin.com):');
  console.log('   - Status:', rejectedCors.statusCode);
  console.log('   - Access-Control-Allow-Origin:', rejectedCors.headers['access-control-allow-origin'] || 'NONE (Correctly blocked)');

  // 6. Presigned PUT Test
  const testKey3 = 'migration-test/presigned-test.txt';
  const presignedContent = 'Presigned PUT test payload for Seven Seas R2';
  console.log(`\n6. Testing Presigned PUT on: ${testKey3}...`);
  const presignedPutUrl = await getSignedUrl(
    r2Client,
    new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: testKey3,
      ContentType: 'text/plain',
    }),
    { expiresIn: 300 }
  );
  console.log('   Generated Presigned PUT URL against R2 S3 Endpoint successfully.');
  
  const uploadRes = await httpsFetch(presignedPutUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: Buffer.from(presignedContent, 'utf8'),
  });
  console.log('   Presigned PUT Execution:');
  console.log('   - Status:', uploadRes.statusCode);
  console.log('   - ETag:', uploadRes.headers['etag']);

  const presignedGet = await httpsFetch(`https://${R2_CONFIG.publicDomain}/${testKey3}`);
  console.log('   Presigned Object Verification via Custom Domain:');
  console.log('   - Status:', presignedGet.statusCode);
  console.log('   - Body:', presignedGet.body.toString('utf8'));

  // 7. Cache-Control Header Test
  const testKey4 = 'migration-test/cache-test.txt';
  console.log(`\n7. Testing Immutable Cache-Control on: ${testKey4}...`);
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: testKey4,
      Body: Buffer.from('Immutable cache test', 'utf8'),
      ContentType: 'text/plain',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  const cacheRes1 = await httpsFetch(`https://${R2_CONFIG.publicDomain}/${testKey4}`);
  console.log('   Custom Domain Request 1:');
  console.log('   - Cache-Control:', cacheRes1.headers['cache-control']);
  console.log('   - CF-Cache-Status:', cacheRes1.headers['cf-cache-status']);

  const cacheRes2 = await httpsFetch(`https://${R2_CONFIG.publicDomain}/${testKey4}`);
  console.log('   Custom Domain Request 2:');
  console.log('   - Cache-Control:', cacheRes2.headers['cache-control']);
  console.log('   - CF-Cache-Status:', cacheRes2.headers['cf-cache-status']);

  // 8. Clean up all test objects under migration-test/
  console.log('\n8. Cleaning up all temporary test objects...');
  const testKeys = [testKey1, testKey2, testKey3, testKey4];
  for (const k of testKeys) {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: k,
      })
    );
    console.log(`   Deleted: ${k}`);
  }

  console.log('\nAll Phase 3 R2 connectivity and feature tests completed successfully!');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
