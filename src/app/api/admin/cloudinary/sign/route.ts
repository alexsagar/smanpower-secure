import { NextResponse } from "next/server";
import { generateUploadSignature } from "@/services/cloudinary.service";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import {
  MEDIA_PURPOSE_MAP,
  MediaPurpose,
  getCloudinaryResourceTypeForPurpose,
} from "@/lib/media-purposes";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get("purpose") as MediaPurpose;
    
    if (!purpose || !MEDIA_PURPOSE_MAP[purpose]) {
      return NextResponse.json({ error: "Invalid or missing purpose" }, { status: 400 });
    }

    const config = MEDIA_PURPOSE_MAP[purpose];
    
    await requirePermission(config.permission);

    // We no longer accept folder from client; we use the config.folder
    const signatureData = generateUploadSignature(
      config.folder,
      config.deliveryType,
      getCloudinaryResourceTypeForPurpose(purpose)
    );
    
    // Append the allowed prefix so client can use it for generating public_id
    return NextResponse.json({
      ...signatureData,
      purpose,
      prefix: config.prefix,
    });
  } catch (error: unknown) {
    logger.error(
      "Cloudinary signature error",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
