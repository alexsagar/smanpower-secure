import { NextRequest, NextResponse } from "next/server";
import {
  requirePermission,
  CANDIDATE_DOCUMENT_PERMISSIONS,
} from "@/lib/permissions";
import {
  ForbiddenError,
  UnauthenticatedError,
  SessionInvalidError,
} from "@/lib/auth-errors";
import { prisma } from "@/lib/prisma";
import { getSignedDocumentUrl } from "@/services/cloudinary.service";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(CANDIDATE_DOCUMENT_PERMISSIONS.VIEW);
    const { id } = await params;

    const doc = await prisma.candidateDocument.findUnique({
      where: { id },
      include: { candidate: true }
    });

    if (!doc) {
      return new NextResponse("Document not found.", { status: 404 });
    }

    if (doc.status !== "SAFE") {
      return new NextResponse("Document is pending security scan or rejected.", { status: 403 });
    }

    // Determine publicId and format
    let publicId = doc.fileUrl;
    let format = doc.mimeType?.split('/')[1] || doc.fileName.split('.').pop() || "pdf";

    // Fallback for legacy records that might have stored the full URL
    if (doc.fileUrl.startsWith("http")) {
      const urlParts = doc.fileUrl.split("/");
      const filenameWithExt = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      publicId = `${folder}/${filenameWithExt.split(".")[0]}`;
      format = filenameWithExt.split(".")[1] || "pdf";
    }

    // Generate short-lived signed URL
    const signedUrl = getSignedDocumentUrl(publicId, format);

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        entity: "CandidateDocument",
        action: "PRIVATE_DOCUMENT_VIEWED",
        entityId: doc.id,
        details: `Viewed private document ID ${doc.id} for candidate ID ${doc.candidate.id}`
      }
    });

    const response = NextResponse.redirect(signedUrl, { status: 307 });
    response.headers.set("Cache-Control", "no-store, private");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Referrer-Policy", "no-referrer");
    
    return response;
  } catch (error: unknown) {
    const isError = error instanceof Error;
    // Not signed in / stale-or-invalid session → 401.
    if (
      error instanceof UnauthenticatedError ||
      error instanceof SessionInvalidError ||
      (isError && error.message?.startsWith("Unauthorized"))
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    // Authenticated but lacks the permission → 403.
    if (error instanceof ForbiddenError || (isError && error.message?.startsWith("Forbidden"))) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    logger.error("Secure document view error:", isError ? error : new Error(String(error)));
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
