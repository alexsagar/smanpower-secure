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
import {
  isCloudinaryPublicIdOwnedByCurrentEnvironment,
  resolveCloudinaryFolder,
} from "@/lib/cloudinary-namespace";

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
  const resolvedFolder = resolveCloudinaryFolder(folder);

  if (!isConfigured) {
    if (DEMO_MODE) {
      logger.warn("Cloudinary is not configured. Returning dummy signature for demo mode.");
      return {
        timestamp: Math.round(new Date().getTime() / 1000),
        signature: "demo-mode-signature",
        folder: resolvedFolder,
        resourceType,
      };
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: resolvedFolder,
      // If deliveryType is private, we must sign `type: "private"`
      ...(deliveryType === "private" ? { type: "private" } : {}),
    },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    signature,
    folder: resolvedFolder,
    resourceType,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    deliveryType,
  };
}

function isOwnedManagedCloudinaryPublicId(publicId: string): boolean {
  return isCloudinaryPublicIdOwnedByCurrentEnvironment(publicId);
}

function rejectUnownedManagedCloudinaryAsset(
  publicId: string,
  operation: string
): false {
  logger.error(`${operation} refused for unmanaged Cloudinary asset.`, {
    publicId,
  });
  return false;
}

/**
 * Deletes an asset from Cloudinary.
 */
export async function deleteAsset(publicId: string): Promise<boolean> {
  if (!isOwnedManagedCloudinaryPublicId(publicId)) {
    return rejectUnownedManagedCloudinaryAsset(publicId, "Cloudinary deletion");
  }

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
  return deleteManagedAsset(publicId, {
    deliveryType: "private",
    resourceType: "raw",
  });
}

export async function deleteManagedAsset(
  publicId: string,
  options: {
    deliveryType?: "upload" | "private";
    resourceType: "image" | "video" | "raw";
  }
): Promise<boolean> {
  if (!isOwnedManagedCloudinaryPublicId(publicId)) {
    return rejectUnownedManagedCloudinaryAsset(
      publicId,
      "Managed Cloudinary deletion"
    );
  }

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
    // Deletion is idempotent: "not found" means the asset is already gone from
    // Cloudinary (e.g. removed manually in the dashboard or by a prior attempt),
    // which is the desired end state — otherwise the DB row is stuck as
    // REMOTE_DELETE_FAILED and can never be cleared from the media library.
    return result.result === "ok" || result.result === "not found";
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
  const resolvedFolder = resolveCloudinaryFolder(folder);

  if (process.env.QA_MODE === "true") {
    return {
      secureUrl: `https://demo.cloudinary.com/${resolvedFolder}/${fileName.replace(/\.[^/.]+$/, "")}.pdf`,
      publicId: `${resolvedFolder}/${fileName.replace(/\.[^/.]+$/, "")}`,
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
        folder: resolvedFolder,
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

export function extractCloudinaryPublicIdFromUrl(
  value: string
): { publicId: string; format: string | null } | null {
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const deliveryIndex = segments.findIndex((segment, index) => {
      if (index < 2) return false;
      return (
        segment === "upload" ||
        segment === "private" ||
        segment === "authenticated"
      );
    });

    if (deliveryIndex < 0) {
      return null;
    }

    let assetSegments = segments.slice(deliveryIndex + 1);
    if (assetSegments[0] && /^v\d+$/.test(assetSegments[0])) {
      assetSegments = assetSegments.slice(1);
    }

    if (assetSegments.length === 0) {
      return null;
    }

    const lastSegment = assetSegments.at(-1);
    if (!lastSegment) {
      return null;
    }

    const extensionIndex = lastSegment.lastIndexOf(".");
    const fileName =
      extensionIndex > 0
        ? lastSegment.slice(0, extensionIndex)
        : lastSegment;
    const format =
      extensionIndex > 0
        ? lastSegment.slice(extensionIndex + 1).toLowerCase()
        : null;

    if (!fileName) {
      return null;
    }

    return {
      publicId: [...assetSegments.slice(0, -1), fileName].join("/"),
      format,
    };
  } catch {
    return null;
  }
}

/**
 * Generates a signed, short-lived URL for accessing a private document.
 */
export function getSignedDocumentUrl(
  publicId: string,
  format: string = "pdf",
  options?: {
    allowUnowned?: boolean;
    resourceType?: "image" | "video" | "raw";
  }
): string {
  if (!options?.allowUnowned && !isOwnedManagedCloudinaryPublicId(publicId)) {
    throw new Error("Cloudinary public ID is outside the approved environment namespace.");
  }

  if (!isConfigured) {
    if (DEMO_MODE) {
      return "https://demo.cloudinary.com/dummy.pdf";
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  // Generate a signed download URL valid for 5 minutes (expires in 300 seconds)
  return cloudinary.utils.private_download_url(publicId, format, {
    expires_at: Math.round(Date.now() / 1000) + 300,
    resource_type: options?.resourceType || "raw",
  });
}
