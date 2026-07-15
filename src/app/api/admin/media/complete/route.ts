import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { MEDIA_PURPOSE_MAP, MediaPurpose } from "@/lib/media-purposes";
import cloudinary from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import {
  authoritativeMediaResourceTypeFromCloudinary,
  cloudinaryDestroyResourceTypeFromAuthoritative,
} from "@/lib/media-resource-type";

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

    // 1. Authoritative verification via Cloudinary Admin API
    // We cannot trust client-supplied data. We fetch the asset metadata securely.
    let assetMeta;
    try {
      assetMeta = await cloudinary.api.resource(data.public_id);
    } catch (e) {
      console.error("Cloudinary asset lookup failed:", e);
      return NextResponse.json({ error: "Failed to verify asset ownership or asset does not exist" }, { status: 400 });
    }

    const verifiedMimeType = `${assetMeta.resource_type}/${assetMeta.format}`;
    const authoritativeResourceType = authoritativeMediaResourceTypeFromCloudinary(
      assetMeta.resource_type,
      verifiedMimeType
    );
    const destroyResourceType =
      cloudinaryDestroyResourceTypeFromAuthoritative(authoritativeResourceType);

    // 2. Validate folder
    if (assetMeta.folder !== config.folder) {
      // Rollback
      await cloudinary.uploader.destroy(data.public_id, { resource_type: destroyResourceType }).catch(() => {});
      return NextResponse.json({ error: "Asset outside approved folder" }, { status: 400 });
    }

    // 3. Validate resource type
    if (assetMeta.resource_type !== config.resourceType) {
      await cloudinary.uploader.destroy(data.public_id, { resource_type: destroyResourceType }).catch(() => {});
      return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
    }
    
    // Validate format (e.g. reject SVG)
    if (!config.allowedFormats.includes(assetMeta.format.toLowerCase())) {
      await cloudinary.uploader.destroy(data.public_id, { resource_type: destroyResourceType }).catch(() => {});
      return NextResponse.json({ error: `Format ${assetMeta.format} not allowed` }, { status: 400 });
    }

    // Validate size and dimensions
    if (assetMeta.bytes > config.maxBytes) {
      await cloudinary.uploader.destroy(data.public_id, { resource_type: destroyResourceType }).catch(() => {});
      return NextResponse.json({ error: "Asset too large" }, { status: 400 });
    }

    if (assetMeta.width && config.maxWidth && assetMeta.width > config.maxWidth) {
      await cloudinary.uploader.destroy(data.public_id, { resource_type: destroyResourceType }).catch(() => {});
      return NextResponse.json({ error: "Asset dimensions too large" }, { status: 400 });
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

    const mediaAsset = await prisma.mediaAsset.create({
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
        duration: assetMeta.duration,
        tags: assetMeta.tags || [],
        folder: assetMeta.folder,
        altText: sanitizedName, // Sanitized
        isPublic: config.isPublic,
        status: "REAL_APPROVED",
      }
    });

    return NextResponse.json({ success: true, media: mediaAsset });
  } catch (error: unknown) {
    logger.error("Complete media upload error:", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save media" },
      { status: 500 }
    );
  }
}
