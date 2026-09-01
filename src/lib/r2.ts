import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

export async function createPresignedUploadUrl(key: string, contentType: string, contentLength: number) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  return signedUrl;
}

export async function verifyR2Object(key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    const response = await r2.send(command);
    return {
      success: true,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      eTag: response.ETag,
    };
  } catch (error) {
    return { success: false, error };
  }
}

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
export async function deleteR2Object(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2.send(command);
    return true;
  } catch (error) {
    console.error("R2 delete failed", error);
    return false;
  }
}
