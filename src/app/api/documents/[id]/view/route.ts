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
import { resolveCloudinaryFolder } from "@/lib/cloudinary-namespace";
import {
  extractCloudinaryPublicIdFromUrl,
  getSignedDocumentUrl,
} from "@/services/cloudinary.service";
import { logger } from "@/lib/logger";

const LEGACY_CANDIDATE_DOCUMENT_FOLDER = "seven-seas-candidates";

function isLegacyCandidateDocumentPublicId(publicId: string): boolean {
  const normalized = publicId.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized.startsWith(`${LEGACY_CANDIDATE_DOCUMENT_FOLDER}/`)) {
    return false;
  }

  const assetName = normalized.slice(
    normalized.lastIndexOf("/") + 1
  );

  return Boolean(assetName && assetName !== "." && assetName !== "..");
}

function isCurrentEnvironmentCandidateDocumentPublicId(
  publicId: string
): boolean {
  const normalized = publicId.trim().replace(/^\/+|\/+$/g, "");
  const folder = `${resolveCloudinaryFolder(
    LEGACY_CANDIDATE_DOCUMENT_FOLDER
  )}/`;

  if (!normalized.startsWith(folder)) {
    return false;
  }

  const assetName = normalized.slice(normalized.lastIndexOf("/") + 1);
  return Boolean(assetName && assetName !== "." && assetName !== "..");
}

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

    // New records store the Cloudinary public ID directly. Legacy rows may still contain a URL.
    let publicId = doc.fileUrl;
    let format = doc.mimeType?.split('/')[1] || doc.fileName.split('.').pop() || "pdf";
    let allowUnowned = false;

    if (doc.fileUrl.startsWith("http")) {
      const extracted = extractCloudinaryPublicIdFromUrl(doc.fileUrl);
      if (!extracted) {
        throw new Error("Candidate document URL could not be mapped to a Cloudinary public ID.");
      }
      if (!isLegacyCandidateDocumentPublicId(extracted.publicId)) {
        throw new Error("Candidate document URL is outside the approved legacy folder.");
      }
      publicId = extracted.publicId;
      format = extracted.format || format;
      allowUnowned = true;
    } else if (!isCurrentEnvironmentCandidateDocumentPublicId(publicId)) {
      throw new Error("Candidate document public ID is outside the approved environment namespace.");
    }

    // Generate short-lived signed URL
    const signedUrl = getSignedDocumentUrl(publicId, format, {
      allowUnowned,
      resourceType: "raw",
    });

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
