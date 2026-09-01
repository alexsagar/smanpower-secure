const fs = require('fs');
const path = 'src/app/api/admin/media/delete/route.ts';
let code = fs.readFileSync(path, 'utf8');

const replacement = `
    // Step C: Call backend provider
    if (updatedAsset.provider === "R2") {
      if (!updatedAsset.storageKey) {
        return NextResponse.json({ error: "R2 object missing storage key" }, { status: 400 });
      }
      
      if (updatedAsset.storageKey.startsWith("legacy/cloudinary/")) {
        return NextResponse.json({ error: "Legacy migrated objects cannot be deleted through this interface." }, { status: 400 });
      }

      try {
        const { deleteR2Object } = await import("@/lib/r2");
        const deleted = await deleteR2Object(updatedAsset.storageKey);
        if (!deleted) throw new Error("R2 deletion failed");
      } catch (err) {
        await prisma.mediaAsset.update({
          where: { id },
          data: {
            deletionState: "REMOTE_DELETE_FAILED",
            lastDeletionErrorCode: "R2_UNAVAILABLE"
          }
        });
        
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "MEDIA_DELETION_FAILED",
            entity: "MediaAsset",
            entityId: id,
            details: "R2 API request failed."
          }
        });

        return NextResponse.json({ error: "The media could not be deleted at this time. Please try again later." }, { status: 500 });
      }
    } else {
      if (updatedAsset.publicId) {
        const resourceType = cloudinaryDestroyResourceTypeFromAuthoritative(
          updatedAsset.resourceType
        );
        try {
          const deleted = await deleteManagedAsset(updatedAsset.publicId, {
            resourceType,
          });

          if (!deleted) {
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
    }
`;

code = code.replace(/\/\/ Step C: Call Cloudinary[\s\S]*?\/\/ Step E: Handle successful remote deletion/, replacement + '\n    // Step E: Handle successful remote deletion');
fs.writeFileSync(path, code);
console.log('Delete route updated.');
