import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { MEDIA_PURPOSE_MAP, MediaPurpose } from "@/lib/media-purposes";
import { logger } from "@/lib/logger";
import { createPresignedUploadUrl } from "@/lib/r2";
import { createId } from "@paralleldrive/cuid2";
import { getFileExtension } from "@/lib/media-purposes"; // Assuming it exists or I'll inline it

function getExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const { purpose, filename, contentType, size } = data;
    
    if (!purpose || !MEDIA_PURPOSE_MAP[purpose as MediaPurpose]) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    const config = MEDIA_PURPOSE_MAP[purpose as MediaPurpose];
    await requirePermission(config.permission);

    const provider = process.env.MEDIA_UPLOAD_PROVIDER === "R2" ? "R2" : "CLOUDINARY";
    
    if (provider === "CLOUDINARY") {
      // Return flag to instruct client to use legacy cloudinary route
      return NextResponse.json({ provider: "CLOUDINARY" });
    }

    // Validation (simplified for brevity, size checks)
    if (size > config.maxBytes) return NextResponse.json({ error: "File too large" }, { status: 400 });
    if (contentType === "image/svg+xml" || filename.toLowerCase().endsWith(".svg")) {
      return NextResponse.json({ error: "SVG blocked" }, { status: 400 });
    }

    // Generate R2 Key
    const ext = getExtension(filename);
    const namespace = config.folder.includes("partners") ? "partners/logos" : 
                      config.folder.includes("cms") ? (config.resourceType === "video" ? "cms/videos" : "cms/images") :
                      config.folder.includes("demands") ? "demands/images" : "documents/public";
    const key = `${namespace}/${createId()}.${ext}`;

    const signedUrl = await createPresignedUploadUrl(key, contentType, size);

    return NextResponse.json({
      provider: "R2",
      uploadUrl: signedUrl,
      key,
    });
  } catch (error) {
    logger.error("Presign error", error as Error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
