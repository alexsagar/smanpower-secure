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
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requirePermission(CANDIDATE_DOCUMENT_PERMISSIONS.VIEW);

    const { public_id, resource_type } = await request.json();

    if (!public_id) {
      return NextResponse.json({ error: "Missing public_id" }, { status: 400 });
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
            details: `Accessed private document: ${public_id}`,
            ipAddress: request.headers.get("x-forwarded-for") || "unknown"
          }
        });
      } catch (err) {
        console.warn("Failed to create audit log for private document access", err);
      }
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    if (error instanceof UnauthenticatedError || error instanceof SessionInvalidError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Private media URL error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate URL" },
      { status: 500 }
    );
  }
}
