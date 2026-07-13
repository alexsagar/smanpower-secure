// ============================================================
// Cloudinary Service Layer
// ============================================================
// Handles secure communication with the Cloudinary API.
// Contains guards to safely no-op when DEMO_MODE is active
// or environment variables are missing.
// ============================================================

import cloudinary from "@/lib/cloudinary";

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

/**
 * Generate a signed signature for client-side uploads.
 * This is used so the frontend can upload directly to Cloudinary
 * without the file passing through our Vercel server.
 */
export function generateUploadSignature(folder: string = "seven-seas-cms", deliveryType: "upload" | "private" = "upload") {
  if (!isConfigured) {
    if (process.env.DEMO_MODE === "true") {
      console.warn("Cloudinary is not configured. Returning dummy signature for Demo Mode.");
      return { timestamp: Math.round(new Date().getTime() / 1000), signature: "demo-mode-signature", folder };
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      // If deliveryType is private, we must sign `type: "private"`
      ...(deliveryType === "private" ? { type: "private" } : {}),
    },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return { timestamp, signature, folder, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY, deliveryType };
}

/**
 * Deletes an asset from Cloudinary.
 */
export async function deleteAsset(publicId: string): Promise<boolean> {
  if (!isConfigured) {
    if (process.env.DEMO_MODE === "true") {
      console.warn("Cloudinary is not configured. Bypassing deletion for Demo Mode.");
      return true;
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    return false;
  }
}

/**
 * Safely deletes a private asset (e.g. for rollback on failed transactions).
 */
export async function deletePrivateAsset(publicId: string): Promise<boolean> {
  if (!isConfigured) return true;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { type: "private", resource_type: "auto" });
    return result.result === "ok";
  } catch (error) {
    console.error(`Failed to rollback/destroy private Cloudinary asset ${publicId}:`, error);
    return false;
  }
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
    if (process.env.DEMO_MODE === "true") {
      console.warn("Cloudinary is not configured. Bypassing upload for Demo Mode.");
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
          console.error("Cloudinary Upload Stream Error:", error);
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
    if (process.env.DEMO_MODE === "true") {
      return "https://demo.cloudinary.com/dummy.pdf";
    }
    throw new Error("Cloudinary environment variables are missing.");
  }

  // Generate a signed download URL valid for 5 minutes (expires in 300 seconds)
  return cloudinary.utils.private_download_url(publicId, format, {
    expires_at: Math.round(Date.now() / 1000) + 300
  });
}
