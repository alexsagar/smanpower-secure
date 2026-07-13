"use server";

import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadMedia(formData: FormData) {
  // TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/media");
    return {
      success: true,
      asset: {
        id: "demo-media-id",
        fileName: "demo_upload.jpg",
        fileUrl: "/images/hero_training_orientation_1782920391505.png",
      },
    };
  }

  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }
    
    // Explicit SVG rejection policy
    if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      return { success: false, error: "SVG uploads are disabled for security reasons." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a Promise wrapper
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "seven-seas" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as any;

    // Create DB record
    const asset = await prisma.mediaAsset.create({
      data: {
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        fileSize: file.size,
        mimeType: file.type,
        width: uploadResult.width,
        height: uploadResult.height,
        status: "REAL_APPROVED", // Real upload
        isPublic: true,
      }
    });

    revalidatePath("/admin/media");

    return { success: true, asset };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: error.message || "Failed to upload file" };
  }
}
