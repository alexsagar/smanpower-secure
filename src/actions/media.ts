"use server";

import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authoritativeMediaResourceTypeFromMimeType } from "@/lib/media-resource-type";
import { logger } from "@/lib/logger";
import { resolveCloudinaryFolder } from "@/lib/cloudinary-namespace";
import { MEDIA_PERMISSIONS, requirePermission } from "@/lib/permissions";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadMedia(formData: FormData) {
  await requirePermission(MEDIA_PERMISSIONS.UPLOAD);

  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      return { success: false, error: "SVG uploads are disabled for security reasons." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const folder = resolveCloudinaryFolder("seven-seas");

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
            return;
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const asset = await prisma.mediaAsset.create({
      data: {
        publicId: uploadResult.public_id,
        assetId: uploadResult.asset_id ?? null,
        folder,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        fileSize: file.size,
        mimeType: file.type,
        resourceType: authoritativeMediaResourceTypeFromMimeType(file.type),
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration ?? null,
        status: "REAL_APPROVED",
        isPublic: true,
      },
    });

    revalidatePath("/admin/media");

    return { success: true, asset };
  } catch (error: unknown) {
    logger.error(
      "Cloudinary upload error",
      error instanceof Error ? error : new Error(String(error))
    );
    return { success: false, error: "Failed to upload file" };
  }
}
