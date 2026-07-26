"use server";

import { requirePermission, requireCurrentAdminUser, DEMAND_PERMISSIONS } from "@/lib/permissions";
import { DEMO_MODE } from "@/config/demo";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { generateUniqueSlug } from "@/lib/slug";
import { auth } from "@/lib/auth";
import { uploadBufferToCloudinary } from "@/services/cloudinary.service";

import { OvertimeStatus, FacilityStatus, DemandStatus, DocumentVisibility, PassportStatus, ApplicationStatus } from "@prisma/client";

// Strict Zod schema for Position payload
const PositionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Position title is required"),
  totalCount: z.number().int().min(1).default(1),
  maleCount: z.number().int().nullable().optional(),
  femaleCount: z.number().int().nullable().optional(),
  minimumQualification: z.string().nullable().optional(),
  requiredExperience: z.string().nullable().optional(),
  requiredSkills: z.string().nullable().optional(),
  salaryCurrency: z.string().nullable().optional(),
  salaryAmount: z.string().nullable().optional(),
  nprEquivalent: z.string().nullable().optional(),
  overtimeStatus: z.nativeEnum(OvertimeStatus).default(OvertimeStatus.NOT_SPECIFIED),
  overtimeNotes: z.string().nullable().optional(),
  workHoursPerDay: z.string().nullable().optional(),
  workDaysPerWeek: z.string().nullable().optional(),
  annualLeave: z.string().nullable().optional(),
  foodFacilityStatus: z.nativeEnum(FacilityStatus).default(FacilityStatus.NOT_SPECIFIED),
  foodFacilityNotes: z.string().nullable().optional(),
  accommodationStatus: z.nativeEnum(FacilityStatus).default(FacilityStatus.NOT_SPECIFIED),
  accommodationNotes: z.string().nullable().optional(),
  contractPeriod: z.string().nullable().optional(),
  otherBenefits: z.string().nullable().optional(),
});

// Strict Zod schema for Document payload
const DocumentSchema = z.object({
  id: z.string().optional(),
  mediaAssetId: z.string().nullable().optional(),
  documentType: z.string().min(1),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  issueDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
});

// Strict Zod schema for Demand Payload
const DemandPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  companyName: z.string().min(1, "Company Name is required"),
  companyLogoId: z.string().nullable().optional(),
  featuredImageId: z.string().nullable().optional(),
  countryId: z.string().min(1, "Country is required"),
  industryId: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  employerAddress: z.string().nullable().optional(),
  demandReferenceNumber: z.string().nullable().optional(),
  approvalDate: z.string().nullable().optional(),
  receivedDate: z.string().nullable().optional(),
  applicationStartDate: z.string().nullable().optional(),
  applicationDeadline: z.string().nullable().optional(),
  interviewDate: z.string().nullable().optional(),
  interviewLocation: z.string().nullable().optional(),
  contractType: z.string().nullable().optional(),
  generalNotes: z.string().nullable().optional(),
  enableApplication: z.boolean().default(true),
  requiredApplicationDocuments: z.string().nullable().optional(),
  candidateInstructions: z.string().nullable().optional(),
  feeTransparencyNotice: z.string().nullable().optional(),
  candidateSafetyNotice: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactWhatsapp: z.string().nullable().optional(),
  applicationConfirmationMessage: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  slug: z.string().nullable().optional(), // Custom pre-publish slug
  positions: z.array(PositionSchema).default([]),
  documents: z.array(DocumentSchema).default([]),
  updatedAt: z.string().optional(), // Used for optimistic concurrency
});

function revalidateDemandCaches(slug?: string) {
  // Only invalidate the real affected outputs using route patterns
  revalidatePath("/admin/demands");
  revalidatePath("/demands");
  if (slug) {
    revalidatePath(`/demands/${slug}`);
  }
  
  revalidateTag("demands:list", "max");
  
  if (slug) {
    revalidateTag(`demand:${slug}`, "max");
  }
}

export async function createDemandAction(formData: FormData) {
  await requirePermission(DEMAND_PERMISSIONS.CREATE);
  if (DEMO_MODE) throw new Error("Cannot create demands in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const rawData = formData.get("data");
    if (!rawData || typeof rawData !== "string") {
      return { success: false, formError: "Invalid payload format" };
    }

    // Limit payload size to prevent DOS (e.g. 500KB)
    if (rawData.length > 500 * 1024) {
      return { success: false, formError: "Payload exceeds size limit" };
    }

    const parsedJson = JSON.parse(rawData);
    const parsed = DemandPayloadSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { 
        success: false, 
        formError: "Validation failed", 
        fieldErrors: parsed.error.flatten().fieldErrors 
      };
    }

    const data = parsed.data;

    // Reject duplicate position IDs in the same payload
    const posIds = data.positions.map(p => p.id).filter(Boolean);
    if (new Set(posIds).size !== posIds.length) {
      return { success: false, formError: "Duplicate position IDs detected." };
    }

    let resultDemand;
    
    // We retry the whole transaction up to 5 times for slug collisions
    let retries = 5;
    let collisionDetected = false;
    
    while (retries > 0) {
      try {
        resultDemand = await prisma.$transaction(async (tx) => {
          let slug = data.slug ? data.slug.trim().toLowerCase().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") : null;
          
          if (!slug) {
            slug = await generateUniqueSlug(data.title, tx);
          }
          
          const created = await tx.demand.create({
            data: {
              slug,
              title: data.title,
              companyName: data.companyName,
              companyLogoId: data.companyLogoId || null,
              featuredImageId: data.featuredImageId || null,
              countryId: data.countryId,
              industryId: data.industryId || null,
              city: data.city || null,
              employerAddress: data.employerAddress || null,
              demandReferenceNumber: data.demandReferenceNumber || null,
              approvalDate: data.approvalDate ? new Date(data.approvalDate) : null,
              receivedDate: data.receivedDate ? new Date(data.receivedDate) : null,
              applicationStartDate: data.applicationStartDate ? new Date(data.applicationStartDate) : null,
              applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
              interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
              interviewLocation: data.interviewLocation || null,
              contractType: data.contractType || null,
              generalNotes: data.generalNotes || null,
              enableApplication: data.enableApplication,
              requiredApplicationDocuments: data.requiredApplicationDocuments || null,
              candidateInstructions: data.candidateInstructions || null,
              feeTransparencyNotice: data.feeTransparencyNotice || null,
              candidateSafetyNotice: data.candidateSafetyNotice || null,
              contactPerson: data.contactPerson || null,
              contactPhone: data.contactPhone || null,
              contactWhatsapp: data.contactWhatsapp || null,
              applicationConfirmationMessage: data.applicationConfirmationMessage || null,
              seoTitle: data.seoTitle || null,
              metaDescription: data.metaDescription || null,
              ogImageUrl: data.ogImageUrl || null,
              canonicalUrl: data.canonicalUrl || null,
              createdById: userId,
              status: "DRAFT", // Hardcode, prevent form payload injection
              isPublic: false, // Hardcode, prevent form payload injection
              positions: {
                create: data.positions.map((pos, index) => ({
                  displayOrder: index,
                  title: pos.title,
                  totalCount: pos.totalCount,
                  maleCount: pos.maleCount,
                  femaleCount: pos.femaleCount,
                  minimumQualification: pos.minimumQualification,
                  requiredExperience: pos.requiredExperience,
                  requiredSkills: pos.requiredSkills,
                  salaryCurrency: pos.salaryCurrency,
                  salaryAmount: pos.salaryAmount,
                  nprEquivalent: pos.nprEquivalent,
                  overtimeStatus: pos.overtimeStatus,
                  overtimeNotes: pos.overtimeNotes,
                  workHoursPerDay: pos.workHoursPerDay,
                  workDaysPerWeek: pos.workDaysPerWeek,
                  annualLeave: pos.annualLeave,
                  foodFacilityStatus: pos.foodFacilityStatus,
                  foodFacilityNotes: pos.foodFacilityNotes,
                  accommodationStatus: pos.accommodationStatus,
                  accommodationNotes: pos.accommodationNotes,
                  contractPeriod: pos.contractPeriod,
                  otherBenefits: pos.otherBenefits,
                  status: "OPEN",
                  isPublic: true,
                }))
              },
              documents: {
                create: data.documents.map((doc) => ({
                  documentType: doc.documentType,
                  mediaAssetId: doc.mediaAssetId || null,
                  title: doc.title,
                  description: doc.description,
                  visibility: doc.visibility,
                  issueDate: doc.issueDate ? new Date(doc.issueDate) : null,
                  expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
                }))
              }
            }
          });

          if (userId) {
            await tx.auditLog.create({
              data: {
                userId,
                entity: "Demand",
                action: "CREATE_DEMAND",
                entityId: created.id,
                details: `Created new demand: ${created.title}`
              }
            });
          }

          return created;
        });
        
        // If we succeeded, break out of retry loop
        break;
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && (err as any).code === 'P2002' && (err as any).meta?.target?.includes('slug')) {
          if (data.slug) {
            // If it was a custom slug, do not auto-suffix. Fail immediately.
            return { success: false, formError: "The provided custom slug is already in use. Please choose another." };
          }
          collisionDetected = true;
          retries--;
          if (retries === 0) {
            return { success: false, formError: "Could not generate a unique slug. Please modify the title slightly." };
          }
        } else {
          console.error("Demand create error:", err);
          return { success: false, formError: "Database error during creation." };
        }
      }
    }

    revalidateDemandCaches(resultDemand?.slug);
    return { success: true, data: { id: resultDemand?.id, slug: resultDemand?.slug } };

  } catch (err: unknown) {
    console.error("Demand creation payload error:", err);
    return { success: false, formError: "Invalid request payload." };
  }
}

export async function updateDemandAction(id: string, formData: FormData) {
  await requirePermission(DEMAND_PERMISSIONS.UPDATE);
  if (DEMO_MODE) throw new Error("Cannot update demands in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const rawData = formData.get("data");
    if (!rawData || typeof rawData !== "string" || rawData.length > 500 * 1024) {
      return { success: false, formError: "Invalid payload format or size" };
    }

    const parsedJson = JSON.parse(rawData);
    const parsed = DemandPayloadSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;
    if (!data.updatedAt) {
      return { success: false, formError: "Missing version/updatedAt for optimistic concurrency check." };
    }

    // Check duplicate positions in request
    const posIds = data.positions.map(p => p.id).filter(id => id && !id.startsWith("temp_"));
    if (new Set(posIds).size !== posIds.length) {
      return { success: false, formError: "Duplicate position IDs detected in payload." };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch existing Demand with positions/applications to diff and validate
      const existing = await tx.demand.findUnique({
        where: { id },
        include: { 
          positions: { include: { _count: { select: { applications: true } } } },
          documents: true 
        }
      });

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      // Check Atomic Concurrency
      if (existing.updatedAt.toISOString() !== data.updatedAt) {
        throw new Error("CONCURRENCY_CONFLICT");
      }

      // Validate incoming IDs belong to this demand
      for (const posId of posIds) {
        if (!existing.positions.some(p => p.id === posId)) {
          throw new Error("INVALID_POSITION_ID");
        }
      }

      const existingPosIds = new Set(existing.positions.map(p => p.id));
      const incomingPosIds = new Set(posIds);

      // Handle omitted positions
      for (const existingPos of existing.positions) {
        if (!incomingPosIds.has(existingPos.id)) {
          const appsCount = await tx.demandApplication.count({ where: { positionId: existingPos.id } });
          const isDemandPublishedHistory = existing.publishedAt !== null;
          const isPosPublicHistory = existingPos.isPublic;
          
          if (appsCount > 0 || isDemandPublishedHistory || isPosPublicHistory) {
            // Cannot hard-delete if history or applications exist
            await tx.demandPosition.update({
              where: { id: existingPos.id },
              data: { status: "CLOSED", isPublic: false }
            });
          } else {
            await tx.demandPosition.delete({ where: { id: existingPos.id } });
          }
        }
      }

      // Handle Upserting payload positions
      for (let i = 0; i < data.positions.length; i++) {
        const p = data.positions[i];
        const posData = {
          displayOrder: i,
          title: p.title,
          totalCount: p.totalCount,
          maleCount: p.maleCount,
          femaleCount: p.femaleCount,
          minimumQualification: p.minimumQualification,
          requiredExperience: p.requiredExperience,
          requiredSkills: p.requiredSkills,
          salaryCurrency: p.salaryCurrency,
          salaryAmount: p.salaryAmount,
          nprEquivalent: p.nprEquivalent,
          overtimeStatus: p.overtimeStatus,
          overtimeNotes: p.overtimeNotes,
          workHoursPerDay: p.workHoursPerDay,
          workDaysPerWeek: p.workDaysPerWeek,
          annualLeave: p.annualLeave,
          foodFacilityStatus: p.foodFacilityStatus,
          foodFacilityNotes: p.foodFacilityNotes,
          accommodationStatus: p.accommodationStatus,
          accommodationNotes: p.accommodationNotes,
          contractPeriod: p.contractPeriod,
          otherBenefits: p.otherBenefits,
        };

        if (p.id && !p.id.startsWith("temp_")) {
          await tx.demandPosition.update({
            where: { id: p.id },
            data: posData
          });
        } else {
          await tx.demandPosition.create({
            data: {
              ...posData,
              demandId: id,
              status: "OPEN",
              isPublic: true,
            }
          });
        }
      }

      // Handle Documents (Unlink omitted ones safely)
      const incomingDocIds = new Set(data.documents.map(d => d.id).filter(id => id && !id.startsWith("temp_")));
      for (const existingDoc of existing.documents) {
        if (!incomingDocIds.has(existingDoc.id)) {
          // Simply delete the DemandDocument relation, preserving the MediaAsset!
          await tx.demandDocument.delete({ where: { id: existingDoc.id } });
        }
      }

      for (const d of data.documents) {
        const docData = {
          documentType: d.documentType,
          mediaAssetId: d.mediaAssetId || null,
          title: d.title,
          description: d.description,
          visibility: d.visibility,
          issueDate: d.issueDate ? new Date(d.issueDate) : null,
          expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
        };

        if (d.id && !d.id.startsWith("temp_")) {
          const existingDocCheck = existing.documents.find(ed => ed.id === d.id);
          if (existingDocCheck && existingDocCheck.visibility === "PRIVATE" && docData.visibility === "PUBLIC") {
            // Safety override: never make private/internal document public accidentally via bulk update
            docData.visibility = "PRIVATE";
          }
          await tx.demandDocument.update({
            where: { id: d.id },
            data: docData
          });
        } else {
          await tx.demandDocument.create({
            data: {
              ...docData,
              demandId: id
            }
          });
        }
      }

      // Update Demand primitive fields
      // Note: `status`, `isPublic`, `publishedAt`, etc. are explicitly excluded.
      // Only allow custom slug update if Demand is not PUBLISHED yet
      // "Published Demand slugs remain locked."
      let updatedSlug = existing.slug;
      if (data.slug && existing.status !== "PUBLISHED") {
         updatedSlug = data.slug.trim().toLowerCase().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
      }

      const updatedDemand = await tx.demand.update({
        where: { id },
        data: {
          slug: updatedSlug,
          title: data.title,
          companyName: data.companyName,
          companyLogoId: data.companyLogoId || null,
              featuredImageId: data.featuredImageId || null,
          countryId: data.countryId,
          industryId: data.industryId || null,
          city: data.city || null,
          employerAddress: data.employerAddress || null,
          demandReferenceNumber: data.demandReferenceNumber || null,
          approvalDate: data.approvalDate ? new Date(data.approvalDate) : null,
          receivedDate: data.receivedDate ? new Date(data.receivedDate) : null,
          applicationStartDate: data.applicationStartDate ? new Date(data.applicationStartDate) : null,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
          interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
          interviewLocation: data.interviewLocation || null,
          contractType: data.contractType || null,
          generalNotes: data.generalNotes || null,
          enableApplication: data.enableApplication,
          requiredApplicationDocuments: data.requiredApplicationDocuments || null,
          candidateInstructions: data.candidateInstructions || null,
          feeTransparencyNotice: data.feeTransparencyNotice || null,
          candidateSafetyNotice: data.candidateSafetyNotice || null,
          contactPerson: data.contactPerson || null,
          contactPhone: data.contactPhone || null,
          contactWhatsapp: data.contactWhatsapp || null,
          applicationConfirmationMessage: data.applicationConfirmationMessage || null,
          seoTitle: data.seoTitle || null,
          metaDescription: data.metaDescription || null,
          ogImageUrl: data.ogImageUrl || null,
          canonicalUrl: data.canonicalUrl || null,
          updatedById: userId,
        }
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            entity: "Demand",
            action: "UPDATE_DEMAND",
            entityId: id,
            details: "Updated demand details and positions"
          }
        });
      }

      return updatedDemand;
    });

    revalidateDemandCaches(result.slug);
    return { success: true, data: { id: result.id, slug: result.slug } };

  } catch (err: unknown) {
    const isError = err instanceof Error;
    if (typeof err === 'object' && err !== null && (err as any).code === 'P2002' && (err as any).meta?.target?.includes('slug')) {
      return { success: false, formError: "The provided custom slug is already in use. Please choose another." };
    }
    if (isError && err.message === "CONCURRENCY_CONFLICT") {
      return { success: false, formError: "This Demand was updated by another user. Refresh the page before saving your changes." };
    }
    if (isError && err.message === "INVALID_POSITION_ID") {
      return { success: false, formError: "Invalid position ID provided." };
    }
    if (isError && err.message === "NOT_FOUND") {
      return { success: false, formError: "Demand not found." };
    }
    console.error("Demand update error:", err);
    return { success: false, formError: "Database error during update." };
  }
}

export async function publishDemandAction(id: string) {
  await requirePermission(DEMAND_PERMISSIONS.PUBLISH);
  if (DEMO_MODE) throw new Error("Cannot modify demands in demo mode.");

  const session = await auth();

  // Validation failures are returned, not thrown: Next redacts thrown Server Action
  // errors in production builds, so on staging the admin only ever saw a generic
  // "unexpected error" and could not tell what was blocking the publish.
  try {
  const result = await prisma.$transaction(async (tx) => {
    // Validate it meets publish criteria (e.g., has positions)
    const demand = await tx.demand.findUnique({
      where: { id },
      include: { positions: true, country: true, documents: true }
    });
    if (!demand) throw new Error("NOT_FOUND");
    
    // Explicit Status check
    if (demand.status !== "DRAFT" && demand.status !== "PUBLISHED") {
      throw new Error("Only DRAFT demands can be published.");
    }
    
    // Demo/Test checks
    const titleLower = demand.title.toLowerCase();
    if (titleLower.includes("demo") || titleLower.includes("test") || titleLower.includes("internal")) {
      // Allow QA test records when QA_MODE is true for tests
      if (process.env.QA_MODE !== "true" && process.env.NODE_ENV !== "test") {
        throw new Error("Cannot publish demo/test/internal demands.");
      }
    }
    
    // Primitive checks
    if (!demand.title || !demand.countryId || !demand.country) {
      throw new Error("Public title and Country are required to publish.");
    }
    
    // Compliance check
    if (!demand.feeTransparencyNotice && !demand.candidateSafetyNotice) {
      throw new Error("Required public compliance/safety wording is missing.");
    }

    // Documents check - No private/internal document is marked public by mistake
    const hasPublicPrivateDoc = demand.documents.some(d => 
      d.visibility === "PUBLIC" && (d.title?.toLowerCase().includes("internal") || d.title?.toLowerCase().includes("private"))
    );
    if (hasPublicPrivateDoc) {
      throw new Error("A document containing 'internal' or 'private' in the title is marked PUBLIC.");
    }

    // Positions check
    if (demand.positions.length === 0) throw new Error("At least one position is required to publish.");
    const validPos = demand.positions.some(p => 
      p.status === "OPEN" && 
      p.isPublic && 
      p.title && 
      !!p.minimumQualification?.trim() && 
      !!p.requiredExperience?.trim() && 
      !!p.requiredSkills?.trim()
    );
    if (!validPos) {
      throw new Error("At least one active public Position with complete details (title, qualifications, experience, skills) is required. Use 'Not required' or 'Training provided' for entry-level positions.");
    }

    const updated = await tx.demand.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        isPublic: true,
        publishedAt: new Date(),
        updatedById: session?.user?.id
      }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "Demand",
          action: "PUBLISH_DEMAND",
          entityId: id,
          details: "Published demand"
        }
      });
    }

    return updated;
  });

  revalidateDemandCaches(result.slug);
  return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { success: false, formError: "Demand not found." };
    }
    console.error("Demand publish error:", err);
    // Only surface our own validation messages; never leak driver/DB errors.
    const isValidationError =
      err instanceof Error && !(typeof (err as any).code === "string");
    return {
      success: false,
      formError: isValidationError ? err.message : "Could not publish this demand.",
    };
  }
}

export async function closeDemandAction(id: string) {
  await requirePermission(DEMAND_PERMISSIONS.UPDATE); // Or distinct CLOSE perm
  if (DEMO_MODE) throw new Error("Cannot modify demands in demo mode.");

  const session = await auth();
  
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.demand.update({
      where: { id },
      data: {
        status: "CLOSED",
        enableApplication: false,
        closedAt: new Date(),
        updatedById: session?.user?.id
      }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "Demand",
          action: "CLOSE_DEMAND",
          entityId: id,
          details: "Closed demand"
        }
      });
    }

    return updated;
  });

  revalidateDemandCaches(result.slug);
  return { success: true };
}

export async function archiveDemandAction(id: string) {
  await requirePermission(DEMAND_PERMISSIONS.DELETE);
  if (DEMO_MODE) throw new Error("Cannot archive demands in demo mode.");

  const session = await auth();

  const demand = await prisma.$transaction(async (tx) => {
    // Soft delete to archive
    const updated = await tx.demand.update({
      where: { id },
      data: { 
        status: "ARCHIVED",
        isPublic: false,
        enableApplication: false,
        deletedAt: new Date() 
      },
      select: { slug: true }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "Demand",
          action: "ARCHIVE_DEMAND",
          entityId: id,
          details: "Archived demand"
        }
      });
    }

    return updated;
  });

  revalidateDemandCaches(demand.slug);
  return { success: true };
}

export async function saveDemandDraftAction(id: string | null, formData: FormData) {
  // Guard before the lookup below: the delegated actions authorize themselves,
  // but this function queries the demand first.
  await requireCurrentAdminUser();

  // Strictly enforce that this only creates or updates DRAFT status
  if (!id) {
    return createDemandAction(formData);
  }

  const existing = await prisma.demand.findUnique({
    where: { id },
    select: { status: true }
  });

  if (!existing) {
    return { success: false, formError: "Demand not found." };
  }

  if (existing.status !== DemandStatus.DRAFT) {
    return { success: false, formError: `Cannot use draft save on a ${existing.status} demand. Use update action or explicit unpublish.` };
  }

  return updateDemandAction(id, formData);
}

import { headers } from 'next/headers';
import { ApplicationSubmissionService } from '@/services/applicationSubmission.service';

export async function applyToDemandAction(prevState: unknown, formData: FormData) {
  if (process.env.PUBLIC_APPLICATIONS_ENABLED !== "true") {
    return {
      success: false,
      formError: "APPLICATIONS_NOT_ENABLED",
      message: "Online applications are not open yet. Please check back later."
    };
  }

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  let ip = 'unknown';
  if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  }
  
  const userAgent = headersList.get('user-agent') || 'unknown';

  const result = await ApplicationSubmissionService.submitApplication(formData, ip, userAgent);

  if (!result.success) {
    return {
      success: false,
      formError: result.formError,
      message: result.message
    };
  }

  return { success: true, message: result.message };
}
