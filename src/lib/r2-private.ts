import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_PRIVATE_ACCESS_KEY_ID = process.env.R2_PRIVATE_ACCESS_KEY_ID;
const R2_PRIVATE_SECRET_ACCESS_KEY = process.env.R2_PRIVATE_SECRET_ACCESS_KEY;
export const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME;

export const r2Private = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_PRIVATE_ACCESS_KEY_ID || "",
    secretAccessKey: R2_PRIVATE_SECRET_ACCESS_KEY || "",
  },
});

export async function createPrivatePresignedUploadUrl(key: string, contentType: string, contentLength: number) {
  const command = new PutObjectCommand({
    Bucket: R2_PRIVATE_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  return getSignedUrl(r2Private, command, { expiresIn: 300 });
}

export async function createPrivatePresignedDownloadUrl(key: string, originalName: string) {
  const command = new GetObjectCommand({
    Bucket: R2_PRIVATE_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}"`,
  });

  return getSignedUrl(r2Private, command, { expiresIn: 300 });
}

export async function verifyPrivateR2Object(key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_PRIVATE_BUCKET_NAME,
      Key: key,
    });
    const response = await r2Private.send(command);
    return {
      success: true,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deletePrivateR2Object(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_PRIVATE_BUCKET_NAME,
      Key: key,
    });
    await r2Private.send(command);
    return true;
  } catch (error) {
    console.error("Private R2 delete failed", error);
    return false;
  }
}
