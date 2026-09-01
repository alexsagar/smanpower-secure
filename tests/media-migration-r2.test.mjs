import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateR2Key,
  resolveContentType,
  isOriginalCloudinaryUrl,
} from '../scripts/migrate-cloudinary-to-r2.mjs';

test('Migration Logic: Deterministic R2 Key Generation', () => {
  // Standard Image
  const imgKey = generateR2Key({
    resource_type: 'image',
    public_id: 'seven-seas-cms/jrd9xrvz9g9sjrmuwpsu',
    format: 'jpg',
  });
  assert.equal(imgKey, 'legacy/cloudinary/image/seven-seas-cms/jrd9xrvz9g9sjrmuwpsu.jpg');

  // Video in Staging Namespace
  const vidKey = generateR2Key({
    resource_type: 'video',
    public_id: 'staging/seven-seas-cms/s6gzjlbemd66efyapcex',
    format: 'mp4',
  });
  assert.equal(vidKey, 'legacy/cloudinary/video/staging/seven-seas-cms/s6gzjlbemd66efyapcex.mp4');

  // Root PDF Asset
  const pdfKey = generateR2Key({
    resource_type: 'image',
    public_id: 'SSIS_License_of_Foreign_Employment_xwnjyf',
    format: 'pdf',
  });
  assert.equal(pdfKey, 'legacy/cloudinary/image/SSIS_License_of_Foreign_Employment_xwnjyf.pdf');

  // Duplicate extension in public_id
  const dupExtKey = generateR2Key({
    resource_type: 'image',
    public_id: 'seven-seas-demands/sample.png',
    format: 'png',
  });
  assert.equal(dupExtKey, 'legacy/cloudinary/image/seven-seas-demands/sample.png');

  // Path traversal protection
  const traversalKey = generateR2Key({
    resource_type: 'image',
    public_id: '../../../etc/passwd',
    format: 'jpg',
  });
  assert.equal(traversalKey, 'legacy/cloudinary/image/etc/passwd.jpg');
});

test('Migration Logic: MIME Type Resolution & PDF Override', () => {
  assert.equal(
    resolveContentType({ format: 'pdf', resource_type: 'image' }),
    'application/pdf'
  );
  assert.equal(
    resolveContentType({ format: 'jpg', resource_type: 'image' }),
    'image/jpeg'
  );
  assert.equal(
    resolveContentType({ format: 'webp', resource_type: 'image' }),
    'image/webp'
  );
  assert.equal(
    resolveContentType({ format: 'mp4', resource_type: 'video' }),
    'video/mp4'
  );
  assert.equal(
    resolveContentType({ format: 'webm', resource_type: 'video' }),
    'video/webm'
  );
});

test('Migration Logic: Cloudinary Original URL Detection', () => {
  const originalUrl = 'https://res.cloudinary.com/o99xd4mq/image/upload/v1784560512/seven-seas-cms/pic.jpg';
  const transformedUrl1 = 'https://res.cloudinary.com/o99xd4mq/image/upload/c_fill,w_800,q_auto/v1784560512/seven-seas-cms/pic.jpg';
  const transformedUrl2 = 'https://res.cloudinary.com/o99xd4mq/video/upload/so_auto,q_auto/v1784560512/staging/seven-seas-cms/hero.mp4';

  assert.equal(isOriginalCloudinaryUrl(originalUrl), true);
  assert.equal(isOriginalCloudinaryUrl(transformedUrl1), false);
  assert.equal(isOriginalCloudinaryUrl(transformedUrl2), false);
});
