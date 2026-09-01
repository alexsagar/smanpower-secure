import { config } from 'dotenv';
config({ path: '.env.local' });
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
(async () => {
  let isTruncated = true;
  let cursor;
  let count = 0;
  let totalBytes = 0;
  while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken } = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: 'legacy/cloudinary/',
        ContinuationToken: cursor,
      })
    );
    if (Contents) {
      count += Contents.length;
      totalBytes += Contents.reduce((acc, obj) => acc + obj.Size, 0);
    }
    isTruncated = IsTruncated;
    cursor = NextContinuationToken;
  }
  console.log('Total Objects:', count);
  console.log('Total Bytes:', totalBytes);
})();
