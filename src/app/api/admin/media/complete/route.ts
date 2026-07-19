import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import {
  MEDIA_PURPOSE_MAP,
  MediaPurpose,
  getFileExtension,
  isCloudinaryResourceTypeAllowedForPurpose,
  isAllowedExtensionForPurpose,
  isAllowedMimeTypeForPurpose,
} from "@/lib/media-purposes";
import cloudinary from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import {
  authoritativeMediaResourceTypeFromCloudinary,
  cloudinaryDestroyResourceTypeFromAuthoritative,
} from "@/lib/media-resource-type";
import {
  isCloudinaryPublicIdOwnedByCurrentEnvironment,
  isCloudinaryPublicIdInsideFolder,
  resolveCloudinaryFolder,
} from "@/lib/cloudinary-namespace";
import { deleteManagedAsset } from "@/services/cloudinary.service";

const VIDEO_METADATA_RETRY_DELAYS_MS = [0, 250, 500, 1000, 2000, 3000];

function getVerifiedCloudinaryFolder(assetMeta: {
  asset_folder?: unknown;
  folder?: unknown;
}): string | null {
  if (typeof assetMeta.asset_folder === "string" && assetMeta.asset_folder.trim()) {
    return assetMeta.asset_folder;
  }

  if (typeof assetMeta.folder === "string" && assetMeta.folder.trim()) {
    return assetMeta.folder;
  }

  return null;
}

function getVerifiedVideoDuration(assetMeta: { duration?: unknown }): number | null {
  if (typeof assetMeta.duration === "number") {
    return Number.isFinite(assetMeta.duration) && assetMeta.duration > 0
      ? assetMeta.duration
      : null;
  }

  if (typeof assetMeta.duration === "string" && assetMeta.duration.trim()) {
    const duration = Number(assetMeta.duration);
    return Number.isFinite(duration) && duration > 0 ? duration : null;
  }

  return null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getVerifiedCloudinaryResource(
  publicId: string,
  options: {
    resource_type: "image" | "video" | "raw";
    type?: "upload" | "private";
  }
) {
  let assetMeta;

  for (let index = 0; index < VIDEO_METADATA_RETRY_DELAYS_MS.length; index += 1) {
    const delay = VIDEO_METADATA_RETRY_DELAYS_MS[index];
    if (delay > 0) {
      await wait(delay);
    }

    assetMeta = await cloudinary.api.resource(publicId, options);

    if (options.resource_type !== "video" || getVerifiedVideoDuration(assetMeta) !== null) {
      return assetMeta;
    }

    logger.warn("Cloudinary video metadata duration is not available yet.", {
      attempt: index + 1,
      resourceType: assetMeta?.resource_type,
      deliveryType: options.type,
      hasDuration: assetMeta?.duration !== undefined && assetMeta?.duration !== null,
      durationType: typeof assetMeta?.duration,
    });
  }

  return assetMeta;
}

async function rollbackManagedUpload(
  publicId: string,
  resourceType: "image" | "video" | "raw"
) {
  try {
    return await deleteManagedAsset(publicId, {
      deliveryType: "upload",
      resourceType,
    });
  } catch (error) {
    logger.error(
      `Failed to rollback managed upload ${publicId}`,
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}

function rejectWithCleanup(
  publicId: string,
  resourceType: "image" | "video" | "raw",
  error: string,
  status: number = 400
) {
  return rollbackManagedUpload(publicId, resourceType).then((rolledBack) => {
    if (!rolledBack) {
      return NextResponse.json(
        { error: "Uploaded asset could not be safely finalized" },
        { status: 500 }
      );
    }

    return NextResponse.json({ error }, { status });
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const purpose = data.purpose as MediaPurpose;
    
    if (!purpose || !MEDIA_PURPOSE_MAP[purpose]) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    const config = MEDIA_PURPOSE_MAP[purpose];
    await requirePermission(config.permission);

    const expectedFolder = resolveCloudinaryFolder(
      config.folder
    );

    if (
      !isCloudinaryPublicIdOwnedByCurrentEnvironment(
        String(data.public_id || "")
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Asset is outside the approved environment namespace",
        },
        { status: 400 }
      );
    }

    // 1. Authoritative verification via Cloudinary Admin API
    // We cannot trust client-supplied data. We fetch the asset metadata securely.
    let assetMeta;
    try {
      assetMeta = await getVerifiedCloudinaryResource(data.public_id, {
        resource_type: config.resourceType,
        type: config.deliveryType,
      });
    } catch (e) {
      logger.warn("Cloudinary asset lookup failed during media completion.");
      return NextResponse.json({ error: "Failed to verify asset ownership or asset does not exist" }, { status: 400 });
    }

    const verifiedMimeType = `${assetMeta.resource_type}/${assetMeta.format}`.toLowerCase();
    const authoritativeResourceType = authoritativeMediaResourceTypeFromCloudinary(
      assetMeta.resource_type,
      verifiedMimeType
    );
    const destroyResourceType =
      cloudinaryDestroyResourceTypeFromAuthoritative(authoritativeResourceType);
    const originalExtension = getFileExtension(data.original_filename);
    const verifiedFolder = getVerifiedCloudinaryFolder(assetMeta);
    const verifiedVideoDuration =
      authoritativeResourceType === "VIDEO"
        ? getVerifiedVideoDuration(assetMeta)
        : null;

    // 2. Validate folder
    if (
      !isCloudinaryPublicIdInsideFolder(data.public_id, expectedFolder) ||
      verifiedFolder !== expectedFolder
    ) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "Asset outside approved folder");
    }

    // 3. Validate resource type
    if (!isCloudinaryResourceTypeAllowedForPurpose(purpose, assetMeta.resource_type)) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "Invalid resource type");
    }

    if (!isAllowedMimeTypeForPurpose(purpose, verifiedMimeType)) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "Unsupported media type");
    }

    if (!isAllowedExtensionForPurpose(purpose, assetMeta.format)) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "Unsupported media format");
    }

    if (originalExtension && !isAllowedExtensionForPurpose(purpose, originalExtension)) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "File extension does not match the approved media type");
    }

    // Validate size and dimensions
    if (assetMeta.bytes > config.maxBytes) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "Asset too large");
    }

    if (assetMeta.width && config.maxWidth && assetMeta.width > config.maxWidth) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "Asset dimensions too large");
    }

    if (
      authoritativeResourceType === "VIDEO" &&
      verifiedVideoDuration === null
    ) {
      return rejectWithCleanup(data.public_id, destroyResourceType, "Verified video metadata is incomplete");
    }

    // Check if asset is already claimed
    const existing = await prisma.mediaAsset.findFirst({
      where: { publicId: data.public_id }
    });
    
    if (existing) {
      return NextResponse.json({ error: "Asset already claimed" }, { status: 400 });
    }

    // Clean up file name
    const sanitizedName = (data.original_filename || "upload").replace(/[\/\\]/g, "").substring(0, 100);

    let mediaAsset;

    try {
      mediaAsset = await prisma.mediaAsset.create({
        data: {
          publicId: assetMeta.public_id,
          assetId: assetMeta.asset_id,
          fileName: sanitizedName,
          fileUrl: assetMeta.secure_url,
          fileSize: assetMeta.bytes,
          mimeType: verifiedMimeType,
          resourceType: authoritativeResourceType,
          width: assetMeta.width,
          height: assetMeta.height,
          duration:
            authoritativeResourceType === "VIDEO"
              ? verifiedVideoDuration
              : assetMeta.duration,
          tags: assetMeta.tags || [],
          folder: verifiedFolder,
          altText: sanitizedName, // Sanitized
          isPublic: config.isPublic,
          status: "REAL_APPROVED",
        }
      });
    } catch (error) {
      const rolledBack = await rollbackManagedUpload(data.public_id, destroyResourceType);
      logger.error(
        "Media persistence failed after Cloudinary upload verification",
        error instanceof Error ? error : new Error(String(error))
      );

      if (!rolledBack) {
        return NextResponse.json(
          { error: "Uploaded asset could not be safely finalized" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to finalize uploaded media" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, media: mediaAsset });
  } catch (error: unknown) {
    logger.error("Complete media upload error:", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to save media" },
      { status: 500 }
    );
  }
}
