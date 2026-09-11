import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission, MEDIA_PERMISSIONS } from "@/lib/permissions";
import { logger } from "@/lib/logger";
import { resolveMediaUrl } from "@/lib/media-resolver";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(MEDIA_PERMISSIONS.VIEW);

    const assets = await prisma.mediaAsset.findMany({
      // Deleted assets no longer exist in Cloudinary; listing them lets an
      // editor pick one and publish a broken image.
      where: { deletionState: { not: "REMOTE_DELETED" } },
      orderBy: { createdAt: "desc" },
    });

    // Migrated R2 assets keep their historical Cloudinary `fileUrl`. Every admin
    // consumer (picker, library preview, rich-text insert) reads `fileUrl` and
    // writes it straight into CMS content, so serve the canonical delivery URL
    // here or editing a page silently reverts its media back to Cloudinary.
    const resolved = assets.map((asset) => ({
      ...asset,
      fileUrl: resolveMediaUrl(asset),
    }));

    return NextResponse.json(
      { assets: resolved },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error: unknown) {
    logger.error(
      "Fetch media error",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
