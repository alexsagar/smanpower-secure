// ============================================================
// Cloudinary Service Layer
// ============================================================
// Handles secure communication with the Cloudinary API.
// Contains guards to safely no-op when DEMO_MODE is active
// or environment variables are missing.
// ============================================================

import cloudinary from "@/lib/cloudinary";
import { DEMO_MODE } from "@/config/demo";
import { logger } from "@/lib/logger";
import type { AuthoritativeMediaResourceType } from "@/lib/media-resource-type";

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

/**
 * Generate a signed signature for client-side uploads.
 * This is used so the frontend can upload directly to Cloudinary
 * without the file passing through our Vercel server.
 */
export function generateUploadSignature(
  folder: string = "seven-seas-cms",
  deliveryType: "upload" | "private" = "upload",
  resourceType: "image" | "video" | "raw" = "image"
) {
  if (!isConfigured) {
    if (DEMO_MODE) {
      logger.warn("Cloudinary is not configured. Returning dummy signature for demo mode.");
      return {
        timestamp: Math.round(new Date().getTime() / 1000),
        signature: "demo-mode-signature",
        folder,
        resourceType,
      };
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      resource_type: resourceType,
      // If deliveryType is private, we must sign `type: "private"`
      ...(deliveryType === "private" ? { type: "private" } : {}),
    },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    signature,
    folder,
    resourceType,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    deliveryType,
  };
}

/**
 * Deletes an asset from Cloudinary.
 */
export async function deleteAsset(publicId: string): Promise<boolean> {
  if (!isConfigured) {
    if (DEMO_MODE) {
      logger.warn("Cloudinary is not configured. Refusing demo-mode asset deletion without confirmation.", { publicId });
      return false;
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    logger.error("Cloudinary deletion failed:", error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Safely deletes a private asset (e.g. for rollback on failed transactions).
 */
export async function deletePrivateAsset(publicId: string): Promise<boolean> {
  if (!isConfigured) {
    logger.error("Private Cloudinary deletion could not be confirmed because configuration is missing.", {
      publicId,
      demoMode: DEMO_MODE,
    });
    return false;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      type: "private",
      resource_type: "raw",
    });
    return result.result === "ok";
  } catch (error) {
    logger.error(`Failed to rollback/destroy private Cloudinary asset ${publicId}:`, error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

export async function deleteManagedAsset(
  publicId: string,
  options: {
    deliveryType?: "upload" | "private";
    resourceType: "image" | "video" | "raw";
  }
): Promise<boolean> {
  if (!isConfigured) {
    logger.error("Managed Cloudinary deletion could not be confirmed because configuration is missing.", {
      publicId,
      deliveryType: options.deliveryType || "upload",
      resourceType: options.resourceType,
      demoMode: DEMO_MODE,
    });
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: options.resourceType,
      ...(options.deliveryType === "private" ? { type: "private" } : {}),
    });
    return result.result === "ok";
  } catch (error) {
    logger.error(`Failed to destroy managed Cloudinary asset ${publicId}:`, error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

export function cloudinaryUploadResourceTypeFromAuthoritative(
  resourceType: AuthoritativeMediaResourceType
): "image" | "video" | "raw" {
  if (resourceType === "IMAGE") return "image";
  if (resourceType === "VIDEO") return "video";
  return "raw";
}


/**
 * Uploads a Buffer directly to Cloudinary via upload_stream.
 * This is used for server-side processing of secure/private candidate documents.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  fileName: string,
  folder: string = "seven-seas-private",
  isPrivate: boolean = false
): Promise<{ secureUrl: string; publicId: string; bytes: number; format: string }> {
  if (process.env.QA_MODE === "true") {
    return {
      secureUrl: `https://demo.cloudinary.com/${folder}/${fileName.replace(/\.[^/.]+$/, "")}.pdf`,
      publicId: `${folder}/${fileName.replace(/\.[^/.]+$/, "")}`,
      bytes: buffer.length,
      format: "pdf"
    };
  }

  if (!isConfigured) {
    if (DEMO_MODE) {
      logger.warn("Cloudinary is not configured. Bypassing upload for demo mode.");
      return {
        secureUrl: "https://demo.cloudinary.com/dummy.pdf",
        publicId: `demo_public_id_${Date.now()}`,
        bytes: buffer.length,
        format: "pdf"
      };
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
        type: isPrivate ? "private" : "upload", // Private means URL signature required
      },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary Upload Stream Error:", error instanceof Error ? error : new Error(String(error)));
          reject(error || new Error("Failed to upload via stream."));
        } else {
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generates a signed, short-lived URL for accessing a private document.
 */
export function getSignedDocumentUrl(publicId: string, format: string = "pdf"): string {
  if (!isConfigured) {
    if (DEMO_MODE) {
      return "https://demo.cloudinary.com/dummy.pdf";
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  // Generate a signed download URL valid for 5 minutes (expires in 300 seconds)
  return cloudinary.utils.private_download_url(publicId, format, {
    expires_at: Math.round(Date.now() / 1000) + 300
  });
}
