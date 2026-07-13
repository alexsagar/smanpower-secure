import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const PRIVATE_UPLOAD_DIR = process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), "private-uploads");

// Ensure upload directory exists
async function ensureDir() {
  try {
    await fs.mkdir(PRIVATE_UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create private upload directory:", error);
  }
}

/**
 * Securely store a private candidate document.
 * This should ONLY be used for sensitive docs like passport, medical, CVs.
 */
export async function storePrivateDocument(
  fileBuffer: Buffer,
  originalName: string,
  candidateId: string,
  type: string
) {
  await ensureDir();

  const fileHash = crypto.randomBytes(32).toString("hex");
  const ext = path.extname(originalName);
  const secureFileName = `${candidateId}_${type}_${fileHash}${ext}`;
  const filePath = path.join(PRIVATE_UPLOAD_DIR, secureFileName);

  await fs.writeFile(filePath, fileBuffer);

  return secureFileName;
}

/**
 * Retrieve a private document, logging the access.
 * Must enforce that the caller has appropriate RBAC permissions.
 */
export async function getPrivateDocument(
  fileName: string,
  userId: string,
  ipAddress: string
): Promise<Buffer | null> {
  const filePath = path.join(PRIVATE_UPLOAD_DIR, fileName);

  try {
    // Audit log the access!
    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_DOWNLOAD",
        entity: "CandidateDocument",
        details: { fileName },
        userId,
        ipAddress,
      }
    });

    const file = await fs.readFile(filePath);
    return file;
  } catch (error) {
    console.error("Failed to read private document:", error);
    return null;
  }
}
