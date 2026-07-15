import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission, MEDIA_PERMISSIONS } from "@/lib/permissions";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(MEDIA_PERMISSIONS.VIEW);

    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { assets },
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
