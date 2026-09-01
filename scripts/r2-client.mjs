import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'seven-seas-media-production';
const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'media.smanpower.com';

if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error('Missing R2 credentials in environment.');
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_CONFIG = {
  bucketName,
  publicDomain,
  accountId,
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
};
