import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission, MEDIA_PERMISSIONS } from "@/lib/permissions";
import { logger } from "@/lib/logger";
import { cloudinaryDestroyResourceTypeFromAuthoritative } from "@/lib/media-resource-type";
import {
  isCloudinaryFolderOwnedByCurrentEnvironment,
  isCloudinaryPublicIdOwnedByCurrentEnvironment,
  resolveCloudinaryFolder,
} from "@/lib/cloudinary-namespace";
import { deleteManagedAsset } from "@/services/cloudinary.service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    await requirePermission(MEDIA_PERMISSIONS.DELETE_OR_ARCHIVE);

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "MediaAsset id is required" }, { status: 400 });
    }

    // Step A: Authenticate and authorize (done above)
    // Load Cloudinary publicId, resource type, folder, and related metadata from PostgreSQL.
    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            heroImages: true,
            heroVideos: true,
            heroPosterImages: true,
            heroMobileImages: true,
            blockImages: true,
            blockVideos: true,
            blockPosterImages: true,
            blockMobileImages: true,
            demandLogos: true,
            demandDocuments: true,
            insightImages: true,
            newsImages: true,
            careerImages: true,
            successStoryImages: true,
          }
        }
      }
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found in database" }, { status: 404 });
    }

    // Confirm it is inside an approved project folder
    if (!asset.folder || !isCloudinaryFolderOwnedByCurrentEnvironment(asset.folder)) {
      return NextResponse.json({ error: "Cannot delete assets outside of approved project folders." }, { status: 400 });
    }

    if (asset.publicId && !isCloudinaryPublicIdOwnedByCurrentEnvironment(asset.publicId)) {
      return NextResponse.json({ error: "Cannot delete assets outside of the approved environment namespace." }, { status: 400 });
    }

    // Confirm it is not a private candidate document
    if (asset.folder === resolveCloudinaryFolder("seven-seas-candidates")) {
      return NextResponse.json({ error: "Cannot delete private candidate documents through generic media route." }, { status: 400 });
    }

    // Check references
    const count = asset._count;
    const isReferenced = 
      count.heroImages > 0 || count.heroVideos > 0 || count.heroPosterImages > 0 ||
      count.heroMobileImages > 0 || count.blockImages > 0 || count.blockVideos > 0 ||
      count.blockPosterImages > 0 || count.blockMobileImages > 0 ||
      count.demandLogos > 0 || count.demandDocuments > 0 || count.insightImages > 0 ||
      count.newsImages > 0 || count.careerImages > 0 || count.successStoryImages > 0;

    if (isReferenced) {
      return NextResponse.json({ error: "Cannot delete asset because it is referenced by other records." }, { status: 400 });
    }

    if (asset.deletionState === "REMOTE_DELETED") {
       return NextResponse.json({ success: true, message: "Asset already deleted." });
    }

    // Step B: Record deletion intent before calling Cloudinary
    let updatedAsset;
    try {
      updatedAsset = await prisma.$transaction(async (tx) => {
        const result = await tx.mediaAsset.update({
          where: { 
            id,
            // Ensure we only transition if it's not already remotely deleted
            deletionState: { not: "REMOTE_DELETED" }
          },
          data: {
            deletionState: "PENDING_REMOTE_DELETE",
            deletionRequestedAt: new Date(),
            deletionAttempts: { increment: 1 },
            lastDeletionErrorCode: null
          }
        });
        
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "MEDIA_DELETION_REQUESTED",
            entity: "MediaAsset",
            entityId: id,
            details: `Requested deletion for media asset ID ${id}`
          }
        });

        return result;
      });
    } catch (e) {
      console.error("Failed to record deletion intent:", e);
      return NextResponse.json({ error: "Database transition failed. Please try again." }, { status: 500 });
    }

    // Step C: Call Cloudinary
    if (updatedAsset.publicId) {
      const resourceType = cloudinaryDestroyResourceTypeFromAuthoritative(
        updatedAsset.resourceType
      );
      try {
        const deleted = await deleteManagedAsset(updatedAsset.publicId, {
          resourceType,
        });

        if (!deleted) {
          // Step D: Handle Cloudinary failure
          await prisma.mediaAsset.update({
            where: { id },
            data: {
              deletionState: "REMOTE_DELETE_FAILED",
              lastDeletionErrorCode: "CLOUDINARY_DELETE_FAILED"
            }
          });
          
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "MEDIA_DELETION_FAILED",
              entity: "MediaAsset",
              entityId: id,
              details: "Cloudinary deletion returned non-ok result."
            }
          });

          return NextResponse.json({ error: "The media could not be deleted at this time. Please try again later." }, { status: 500 });
        }
      } catch (err) {
        // Step D: Handle Cloudinary failure (Network/API error)
        await prisma.mediaAsset.update({
          where: { id },
          data: {
            deletionState: "REMOTE_DELETE_FAILED",
            lastDeletionErrorCode: "CLOUDINARY_UNAVAILABLE"
          }
        });
        
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "MEDIA_DELETION_FAILED",
            entity: "MediaAsset",
            entityId: id,
            details: "Cloudinary API request failed."
          }
        });

        return NextResponse.json({ error: "The media could not be deleted at this time. Please try again later." }, { status: 500 });
      }
    }

    // Step E: Handle successful remote deletion
    try {
      await prisma.$transaction(async (tx) => {
        await tx.mediaAsset.update({
          where: { id },
          data: {
            deletionState: "REMOTE_DELETED",
            remoteDeletedAt: new Date(),
            lastDeletionErrorCode: null
          }
        });
        
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "MEDIA_ASSET_DELETED",
            entity: "MediaAsset",
            entityId: id,
            details: `Completed media deletion for asset ID ${id}`
          }
        });
      });
      return NextResponse.json({ success: true });
    } catch (e) {
      // Step F: Handle database failure after Cloudinary success
      console.error("Database finalization failed after Cloudinary success:", e);
      // We don't change the state because Prisma just failed. 
      // It remains in PENDING_REMOTE_DELETE. We log an operational error.
      try {
        await prisma.auditLog.create({
           data: {
             userId: user.id,
             action: "MEDIA_DELETION_SYNC_FAILED",
             entity: "MediaAsset",
             entityId: id,
             details: "Database finalization failed. Reconciliation required."
           }
        });
      } catch (auditErr) {
        // We can't even write the audit log if the DB is down
        console.error("Failed to write sync-failure audit log:", auditErr);
      }
      
      return NextResponse.json(
        { error: "The media was removed remotely but database finalization failed. Please try again later or contact support." }, 
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    logger.error("Delete media error:", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to process media deletion request." },
      { status: 500 }
    );
  }
}
