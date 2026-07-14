import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import {
  requirePermission,
  CANDIDATE_DOCUMENT_PERMISSIONS,
} from "@/lib/permissions";
import {
  ForbiddenError,
  SessionInvalidError,
  UnauthenticatedError,
} from "@/lib/auth-errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

function jsonWithPrivateHeaders(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, private");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(CANDIDATE_DOCUMENT_PERMISSIONS.VIEW);

    const { public_id, resource_type } = await request.json();

    if (!public_id) {
      return jsonWithPrivateHeaders({ error: "Missing public_id" }, { status: 400 });
    }

    // Generate a signed URL that expires in 1 hour
    const url = cloudinary.utils.private_download_url(
      public_id,
      "pdf",
      {
        resource_type: resource_type || "image",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }
    );

    // Audit Log the access if in production DB mode
    if (process.env.DEMO_MODE !== "true") {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "VIEW_PRIVATE_DOCUMENT",
            entity: "MediaAsset",
            entityId: public_id,
            details: "Generated private media download URL",
          }
        });
      } catch (err) {
        logger.warn("Failed to create audit log for private document access", err);
      }
    }

    return jsonWithPrivateHeaders({ url });
  } catch (error: unknown) {
    if (error instanceof UnauthenticatedError || error instanceof SessionInvalidError) {
      return jsonWithPrivateHeaders({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return jsonWithPrivateHeaders({ error: "Forbidden" }, { status: 403 });
    }
    logger.error(
      "Private media URL error",
      error instanceof Error ? error : new Error(String(error))
    );
    return jsonWithPrivateHeaders(
      { error: "Failed to generate URL" },
      { status: 500 }
    );
  }
}
