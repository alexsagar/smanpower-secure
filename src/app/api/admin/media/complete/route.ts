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
  cloudinaryMimeType,
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

// Bounded verification retries. Cloudinary populates verified video duration
// asynchronously, but with `media_metadata: true` it is available within a few
// hundred ms, so a short 3-attempt schedule is sufficient.
const VIDEO_METADATA_RETRY_DELAYS_MS = [0, 500, 1000];

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

// Accept only a positive finite number, or a positive finite numeric string of
// seconds. Rejects undefined/null/""/0/negative/NaN/Infinity/nonnumeric text.
// A formatted duration like "00:01:18.500" parses to NaN and is rejected here —
// we intentionally do not implement a timestamp parser.
function normalizePositiveSeconds(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

type CloudinaryDurationSource = {
  duration?: unknown;
  video_duration?: unknown;
  media_metadata?: unknown;
};

// Extract verified video duration in seconds from the authenticated Cloudinary
// Admin API response, in deterministic candidate priority. `format_duration` is
// deliberately excluded: the real response has not proven it to be numeric
// seconds, and it is typically a formatted string.
function getVerifiedVideoDuration(assetMeta: CloudinaryDurationSource): number | null {
  const mediaMetadata =
    assetMeta.media_metadata &&
    typeof assetMeta.media_metadata === "object" &&
    !Array.isArray(assetMeta.media_metadata)
      ? (assetMeta.media_metadata as Record<string, unknown>)
      : null;

  const candidates: unknown[] = [
    assetMeta.duration,
    assetMeta.video_duration,
    mediaMetadata?.duration,
    mediaMetadata?.video_duration,
  ];

  for (const candidate of candidates) {
    const normalized = normalizePositiveSeconds(candidate);
    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
}

// Temporary safe diagnostics for the authenticated Admin API response. Logs
// only key names, presence and value TYPES — never the values themselves, and
// never any credential/secret/header/URL.
function logVideoMetadataDiagnostics(
  assetMeta: Record<string, unknown> | undefined,
  attempt: number,
  deliveryType?: string
) {
  if (!assetMeta) {
    return;
  }

  const mediaMetadata =
    assetMeta.media_metadata &&
    typeof assetMeta.media_metadata === "object" &&
    !Array.isArray(assetMeta.media_metadata)
      ? (assetMeta.media_metadata as Record<string, unknown>)
      : null;

  logger.warn("Cloudinary video metadata duration is not available yet.", {
    attempt,
    resourceType: assetMeta.resource_type,
    deliveryType,
    assetKeys: Object.keys(assetMeta),
    hasMediaMetadata: mediaMetadata !== null,
    mediaMetadataKeys: mediaMetadata ? Object.keys(mediaMetadata) : null,
    durationType: typeof assetMeta.duration,
    hasDuration: assetMeta.duration !== undefined && assetMeta.duration !== null,
    videoDurationType: typeof assetMeta.video_duration,
    hasVideoDuration:
      assetMeta.video_duration !== undefined && assetMeta.video_duration !== null,
    formatDurationType: typeof assetMeta.format_duration,
    hasFormatDuration:
      assetMeta.format_duration !== undefined && assetMeta.format_duration !== null,
    mediaMetadataDurationType: typeof mediaMetadata?.duration,
    mediaMetadataVideoDurationType: typeof mediaMetadata?.video_duration,
    mediaMetadataFormatDurationType: typeof mediaMetadata?.format_duration,
  });
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
  const isVideo = options.resource_type === "video";
  // Only videos need verified duration metadata; images/raw don't request it.
  const lookupOptions = isVideo ? { ...options, media_metadata: true } : options;

  let assetMeta;

  for (let index = 0; index < VIDEO_METADATA_RETRY_DELAYS_MS.length; index += 1) {
    const delay = VIDEO_METADATA_RETRY_DELAYS_MS[index];
    if (delay > 0) {
      await wait(delay);
    }

    assetMeta = await cloudinary.api.resource(publicId, lookupOptions);

    if (!isVideo || getVerifiedVideoDuration(assetMeta) !== null) {
      return assetMeta;
    }

    logVideoMetadataDiagnostics(assetMeta, index + 1, options.type);
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

    const verifiedMimeType = cloudinaryMimeType(assetMeta.resource_type, assetMeta.format);
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
