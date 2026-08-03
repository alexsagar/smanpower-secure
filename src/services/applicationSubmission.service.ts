import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PassportStatus, DocumentType } from '@prisma/client';
import { checkRateLimit } from '@/lib/rate-limit';
import { hashIp, hashUserAgent } from '@/lib/privacy';
import { validateCandidateFile } from '@/lib/file-validation';
import { resolveDocumentRequirements } from '@/lib/document-requirements';
import { uploadBufferToCloudinary, deletePrivateAsset } from '@/services/cloudinary.service';
import { CandidateMatchingService } from '@/services/candidateMatching.service';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import { verifyTurnstileToken } from "@/services/turnstile.service";
import { getDemandApplicationStatus } from "@/lib/demand-presentation";

export const ApplicationSubmissionSchema = z.object({
  demandId: z.string().min(1, "Demand ID is required"),
  positionId: z.string().min(1, "Position ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  provinceDistrict: z.string().min(1, "Location is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  educationLevel: z.string().min(1, "Education is required"),
  skillCategory: z.string().min(1, "Skill category is required"),
  workExperience: z.string().min(1, "Work experience is required"),
  passportStatus: z.nativeEnum(PassportStatus),
  availableForInterview: z.coerce.boolean(),
  demandDetailsRead: z.coerce.boolean(),
  privacyConsentGiven: z.coerce.boolean(),
  safetyAcknowledgement: z.coerce.boolean(),
  cfTurnstileResponse: z.string().optional().nullable(),
});

export type ApplicationSubmissionResult = {
  success: boolean;
  formError?: string;
  message?: string;
  applicationId?: string;
  statusCode: number; // For HTTP responses
};

export class ApplicationSubmissionService {
  private static async cleanupPrivateUploads(
    uploadedDocsData: Array<{ publicId: string }>,
    logContext: string
  ) {
    for (const doc of uploadedDocsData) {
      try {
        const deleted = await deletePrivateAsset(doc.publicId);
        if (!deleted) {
          logger.error(`${logContext}: private asset cleanup was not confirmed`, {
            publicId: doc.publicId,
          });
        }
      } catch (err) {
        logger.error(`${logContext}: private asset cleanup threw`, {
          publicId: doc.publicId,
          error: err,
        });
      }
    }
  }

  /**
   * Main entry point for processing an application securely.
   */
  static async submitApplication(formData: FormData, ipAddress: string, userAgent: string): Promise<ApplicationSubmissionResult> {
    try {
      // 1. Zod Validation for non-file fields
      const rawData: Record<string, unknown> = {};
      const fileData: { key: string, file: File }[] = [];
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (value.size > 0) { // Ignore empty files
            fileData.push({ key, file: value });
          }
        } else {
          rawData[key] = value;
        }
      }

      // Convert checkboxes correctly
      rawData.availableForInterview = rawData.availableForInterview === "on" || rawData.availableForInterview === "true";
      rawData.demandDetailsRead = rawData.demandDetailsRead === "on" || rawData.demandDetailsRead === "true";
      rawData.privacyConsentGiven = rawData.privacyConsentGiven === "on" || rawData.privacyConsentGiven === "true";
      rawData.safetyAcknowledgement = rawData.safetyAcknowledgement === "on" || rawData.safetyAcknowledgement === "true";
      
      // Remap turnstile specifically.
      // The Turnstile widget injects a hidden input literally named
      // "cf-turnstile-response"; that is the authoritative field. The camelCase
      // and "turnstileToken" spellings are only used by the JSON API route and
      // older tests, so they stay as fallbacks.
      if (!rawData.cfTurnstileResponse) {
         rawData.cfTurnstileResponse =
           formData.get('cf-turnstile-response') ||
           formData.get('turnstileToken') ||
           null;
      }

      const parsed = ApplicationSubmissionSchema.safeParse(rawData);
      if (!parsed.success) {
        logger.warn("Application validation failed", parsed.error.format());
        return { success: false, formError: "VALIDATION_FAILED", message: "Please fill out all required fields.", statusCode: 400 };
      }

      const data = parsed.data;

      // 2. Enforce Consent
      if (!data.demandDetailsRead || !data.privacyConsentGiven || !data.safetyAcknowledgement) {
        return { success: false, formError: "CONSENT_REQUIRED", message: "All consents must be agreed to.", statusCode: 400 };
      }

      // 3. Verify Rate Limit
      if (ipAddress === "unknown") return { success: false, formError: "SECURITY_ERROR", message: "Security error: Cannot verify client network.", statusCode: 400 };
      
      const ipLimit = await checkRateLimit("apply_ip", ipAddress);
      if (!ipLimit.success) return { success: false, formError: "RATE_LIMIT_EXCEEDED", message: ipLimit.message, statusCode: ipLimit.statusCode || 429 };
      
      const emailLimit = await checkRateLimit("apply_id", data.email || data.phone || "anonymous");
      if (!emailLimit.success) return { success: false, formError: "RATE_LIMIT_EXCEEDED", message: emailLimit.message, statusCode: emailLimit.statusCode || 429 };

      // 4. Verify Turnstile
      const turnstileToken = data.cfTurnstileResponse;
      const turnstileResult = await verifyTurnstileToken(turnstileToken, "candidate_application");
      if (!turnstileResult.success) {
        return { success: false, formError: turnstileResult.errorCodes?.[0] === "missing-input-response" ? "MISSING_TOKEN" : "INVALID_TOKEN", message: turnstileResult.message || "Security verification failed.", statusCode: 400 };
      }

      // 5. Enforce Demand and Position State
      const demand = await prisma.demand.findUnique({
        where: { id: data.demandId },
        include: { positions: { where: { id: data.positionId } }, country: true }
      });

      // The API and server action enforce the global feature flag before this
      // service; this check owns the demand-level dates and lifecycle rules.
      if (!demand) {
        return { success: false, formError: "CLOSED", message: "This demand is no longer accepting applications.", statusCode: 400 };
      }
      const applicationStatus = getDemandApplicationStatus(demand, true);
      if (applicationStatus.applicationStatus === "DEADLINE_PASSED") {
        return { success: false, formError: "EXPIRED", message: "The application deadline for this demand has passed.", statusCode: 400 };
      }
      if (applicationStatus.applicationStatus === "NOT_YET_OPEN") {
        return { success: false, formError: "NOT_STARTED", message: "Applications for this demand have not started yet.", statusCode: 400 };
      }
      if (!applicationStatus.canApply) {
        return { success: false, formError: "CLOSED", message: "This demand is no longer accepting applications.", statusCode: 400 };
      }
      
      const position = demand.positions[0];
      if (!position || position.status !== "OPEN" || !position.isPublic) {
        return { success: false, formError: "CLOSED", message: "This position is no longer accepting applications.", statusCode: 400 };
      }

      if (position.deadlineOverride && position.deadlineOverride < new Date()) {
        return { success: false, formError: "EXPIRED", message: "The application deadline for this position has passed.", statusCode: 400 };
      }

      // 6. Document Requirement Resolution
      const requirements = await resolveDocumentRequirements(data.demandId, data.positionId);
      
      // Determine expected files
      const requiredTypes = requirements.filter(r => r.required).map(r => r.documentType);
      const allAllowedTypes = requirements.map(r => r.documentType);

      // Validate files
      const validatedFiles: { file: File, docType: DocumentType }[] = [];
      
      for (const { key, file } of fileData) {
        // Map common frontend keys to DocumentType enum safely
        let mappedType: DocumentType | null = null;
        if (key === 'cvFile' || key === 'CV') mappedType = 'CV';
        else if (key === 'certFile' || key === 'TRADE_CERTIFICATE') mappedType = 'TRADE_CERTIFICATE';
        else if (key === 'passportFile' || key === 'PASSPORT_COPY') mappedType = 'PASSPORT_COPY';
        else if (key === 'trainingFile' || key === 'TRAINING_CERTIFICATE') mappedType = 'TRAINING_CERTIFICATE';
        else if (key === 'photoFile' || key === 'PHOTO') mappedType = 'PHOTO';
        else if (key === 'drivingLicense' || key === 'DRIVING_LICENSE') mappedType = 'DRIVING_LICENSE';
        
        if (!mappedType) {
          return { success: false, formError: "INVALID_FILE_FIELD", message: `Unexpected file field: ${key}`, statusCode: 400 };
        }

        const reqDef = requirements.find(r => r.documentType === mappedType);
        if (!reqDef) {
           return { success: false, formError: "UNEXPECTED_DOCUMENT", message: `Document type ${mappedType} is not required or allowed for this position.`, statusCode: 400 };
        }

        // Duplicate check for document type
        if (validatedFiles.some(v => v.docType === mappedType)) {
          return { success: false, formError: "DUPLICATE_DOCUMENT", message: `Multiple files provided for document type: ${mappedType}`, statusCode: 400 };
        }

        const mimeList = reqDef.allowedMimeTypes.split(',').map(s => s.trim());
        const validationResult = await validateCandidateFile(file, reqDef.maxSizeMb, mimeList);
        
        if (!validationResult.valid) {
          return { success: false, formError: "INVALID_FILE", message: validationResult.error, statusCode: 400 };
        }

        validatedFiles.push({ file, docType: mappedType });
      }

      // Ensure all required docs are present
      for (const reqType of requiredTypes) {
        if (!validatedFiles.some(v => v.docType === reqType)) {
          return { success: false, formError: "MISSING_DOCUMENT", message: `Required document missing: ${reqType}`, statusCode: 400 };
        }
      }

      // 7. Upload Workflow
      const uploadedDocsData: {
        documentType: DocumentType;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        isPrivate: boolean;
        publicId: string;
      }[] = [];
      try {
        for (const vf of validatedFiles) {
          const buffer = Buffer.from(await vf.file.arrayBuffer());
          const randomId = crypto.randomUUID();
          const uploadResult = await uploadBufferToCloudinary(buffer, randomId, "seven-seas-candidates", true);
          uploadedDocsData.push({
            documentType: vf.docType,
            fileName: vf.file.name,
            fileUrl: uploadResult.publicId,
            fileSize: uploadResult.bytes,
            mimeType: uploadResult.format,
            isPrivate: true,
            publicId: uploadResult.publicId
          });
        }
      } catch (uploadError) {
        logger.error("Cloudinary upload failed", uploadError);
        // Rollback uploaded files
        await this.cleanupPrivateUploads(
          uploadedDocsData,
          "Failed to delete private asset during upload error rollback"
        );
        return { success: false, formError: "SERVER_ERROR", message: "Failed to upload documents. Please try again.", statusCode: 500 };
      }

      // 8. Privacy Hashing
      let hashedIpStr: string;
      let hashedUaStr: string;
      try {
         hashedIpStr = hashIp(ipAddress);
         hashedUaStr = hashUserAgent(userAgent);
      } catch (e) {
         // Privacy hashing failed, likely missing secret in prod
         await this.cleanupPrivateUploads(
           uploadedDocsData,
           "Failed to cleanup on privacy hashing error"
         );
         return { success: false, formError: "SERVER_ERROR", message: "Server configuration error.", statusCode: 500 };
      }

      // 9. Database Workflow (Candidate matching + Application + Docs)
      try {
        const application = await prisma.$transaction(async (tx) => {
          // Resolve Candidate
          const matchResult = await CandidateMatchingService.resolveCandidate({
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            province: data.provinceDistrict,
            district: data.provinceDistrict,
            educationLevel: data.educationLevel,
            workExperience: data.workExperience,
            skillCategory: data.skillCategory,
          }, tx);

          // Create Docs
          for (const doc of uploadedDocsData) {
            await tx.candidateDocument.create({
              data: {
                candidateId: matchResult.candidate.id,
                documentType: doc.documentType,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                fileSize: doc.fileSize,
                mimeType: doc.mimeType,
                isPrivate: doc.isPrivate,
                status: "PENDING_SCAN" // Enforced quarantine state
              }
            });
          }

          const now = new Date();
          // Create Application
          return tx.demandApplication.create({
            data: {
              demandId: data.demandId,
              positionId: data.positionId,
              candidateId: matchResult.candidate.id,
              demandTitle: demand.title,
              companyName: demand.companyName,
              countryName: demand.country.name,
              positionName: position.title,
              passportStatus: data.passportStatus,
              provinceSnapshot: data.provinceDistrict,
              districtSnapshot: data.provinceDistrict,
              education: data.educationLevel,
              experience: data.workExperience,
              skills: data.skillCategory,
              availableForInterview: data.availableForInterview,
              demandDetailsRead: data.demandDetailsRead,
              privacyConsentGiven: data.privacyConsentGiven,
              safetyAcknowledgement: data.safetyAcknowledgement,
              consentTimestamp: now,
              safetyAckTimestamp: now,
              feeAckTimestamp: now,
              hashedIp: hashedIpStr,
              hashedUserAgent: hashedUaStr,
              status: "SUBMITTED",
              adminNotes: matchResult.isPossibleDuplicate ? "FLAG: POSSIBLE_DUPLICATE" : null,
              statusHistory: [{ status: "SUBMITTED", date: now.toISOString(), note: "Application submitted via public portal" }],
            }
          });
        });

        return { success: true, message: "Application submitted successfully.", applicationId: application.id, statusCode: 200 };

      } catch (txErr: unknown) {
        const errMessage = txErr instanceof Error ? txErr.message : String(txErr);
        const errCode = txErr && typeof txErr === 'object' && 'code' in txErr ? (txErr as {code: string}).code : 'UNKNOWN';
        logger.warn("Prisma Transaction failed during application submission", { error: errMessage, code: errCode });
        
        // Compensating Transaction: Rollback Cloudinary Uploads
        await this.cleanupPrivateUploads(
          uploadedDocsData,
          "Failed to delete private asset during transaction rollback cleanup"
        );
        
        if (errCode === "P2002") {
           return { success: false, formError: "DUPLICATE", message: "You have already applied for this position.", statusCode: 409 };
        }
        return { success: false, formError: "SERVER_ERROR", message: "An unexpected error occurred. Please try again later.", statusCode: 500 };
      }
    } catch (err: unknown) {
      logger.error("Application error:", err instanceof Error ? err : new Error(String(err)));
      return { success: false, formError: "SERVER_ERROR", message: "An unexpected error occurred. Please try again later.", statusCode: 500 };
    }
  }
}
