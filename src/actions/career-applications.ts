"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { uploadBufferToCloudinary } from "@/services/cloudinary.service";
import { headers } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ApplicationStatus } from "@prisma/client";
import { verifyTurnstileToken } from "@/services/turnstile.service";

const CareerApplicationSchema = z.object({
  careerOpeningId: z.string().min(1, "Career ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  coverLetter: z.string().optional(),
});

export async function applyToCareerAction(prevState: any, formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  if (ip === "unknown") return { success: false, formError: "SECURITY_ERROR", message: "Security error: Cannot verify client network." };
  
  const ipLimit = await checkRateLimit("career_ip", ip);
  if (!ipLimit.success) return { success: false, formError: "RATE_LIMIT_EXCEEDED", message: ipLimit.message };
  
  const emailLimit = await checkRateLimit("career_id", formData.get("email") as string || "anonymous");
  if (!emailLimit.success) return { success: false, formError: "RATE_LIMIT_EXCEEDED", message: emailLimit.message };

  // Turnstile Verification
  const turnstileToken = formData.get('cf-turnstile-response') as string | null;
  const turnstileResult = await verifyTurnstileToken(turnstileToken, "career_application");
  if (!turnstileResult.success) {
    return { success: false, formError: turnstileResult.errorCodes?.[0] === "missing-input-response" ? "MISSING_TOKEN" : "INVALID_TOKEN", message: turnstileResult.message || "Security verification failed." };
  }

  try {
    const rawData = {
      careerOpeningId: formData.get("careerOpeningId"),
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      coverLetter: formData.get("coverLetter"),
    };

    const parsed = CareerApplicationSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, formError: "Validation failed", message: "Please fill out all required fields correctly." };
    }

    const data = parsed.data;

    // Verify opening
    const opening = await prisma.careerOpening.findUnique({
      where: { id: data.careerOpeningId },
    });

    if (!opening || opening.status !== "OPEN") {
      return { success: false, formError: "CLOSED", message: "This position is no longer accepting applications." };
    }

    // Process CV Upload
    const cvFile = formData.get("cvFile") as File | null;
    let resumeUrl = null;

    if (cvFile && cvFile.size > 0) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (cvFile.size > MAX_FILE_SIZE) {
        return { success: false, formError: "FILE_TOO_LARGE", message: "CV file exceeds 5MB limit." };
      }

      if (cvFile.type !== "application/pdf") {
        return { success: false, formError: "INVALID_FILE_TYPE", message: "CV must be a PDF." };
      }

      const buffer = await cvFile.arrayBuffer();
      const uint8 = new Uint8Array(buffer.slice(0, 4));
      const hex = Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      if (!hex.startsWith("25504446")) {
        return { success: false, formError: "INVALID_FILE_TYPE", message: "CV appears to be a corrupt or invalid PDF." };
      }

      try {
        const uploadResult = await uploadBufferToCloudinary(Buffer.from(buffer), crypto.randomUUID(), "seven-seas-careers", false);
        resumeUrl = uploadResult.secureUrl;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return { success: false, formError: "UPLOAD_FAILED", message: "Failed to upload document. Please try again." };
      }
    } else {
      return { success: false, formError: "MISSING_FILE", message: "A CV/Resume is required." };
    }

    // Save to DB
    await prisma.careerApplication.create({
      data: {
        careerOpeningId: data.careerOpeningId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        coverLetter: data.coverLetter || null,
        resumeUrl,
        hashedIp: ip,
      }
    });

    return { success: true };

  } catch (error) {
    console.error("Career application error:", error);
    return { success: false, formError: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." };
  }
}

export async function deleteCareerApplicationAction(id: string) {
  // Can add permission check if needed, using auth session
  const app = await prisma.careerApplication.findUnique({ where: { id } });
  if (!app) throw new Error("Application not found");

  await prisma.careerApplication.delete({ where: { id } });
  
  // If we want to delete from Cloudinary we could:
  // if (app.resumeUrl) { ... } // But not strictly required right now

  return { success: true };
}
