"use server";

import { CareerOpeningStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEMO_MODE } from "@/config/demo";
import { auth } from "@/lib/auth";
import { CAREER_PERMISSIONS, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug, slugify } from "@/lib/slug";
import { getSafeExternalHttpUrl } from "@/lib/html-safety";

const CareerPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  lang: z.enum(["en", "ne"]).default("en"),
  slug: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  employmentType: z.string().nullable().optional(),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().nullable().optional(),
  responsibilities: z.string().nullable().optional(),
  applicationEmail: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  applicationUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  deadline: z.string().nullable().optional(),
  imageId: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  noIndex: z.boolean().default(false),
});

function revalidateCareers(slug?: string) {
  revalidatePath("/admin/careers");
  revalidatePath("/en/careers");
  revalidatePath("/ne/careers");
  if (slug) {
    revalidatePath(`/en/careers/${slug}`);
    revalidatePath(`/ne/careers/${slug}`);
  }
}

export async function createCareerAction(formData: FormData) {
  await requirePermission(CAREER_PERMISSIONS.MANAGE);
  if (DEMO_MODE) throw new Error("Cannot create careers in demo mode.");

  const rawData = formData.get("data");
  if (!rawData || typeof rawData !== "string") {
    return { success: false, formError: "Invalid payload format" };
  }

  const parsed = CareerPayloadSchema.safeParse(JSON.parse(rawData));
  if (!parsed.success) {
    return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const session = await auth();
  const userId = session?.user?.id;
  const data = parsed.data;
  const safeApplicationUrl = getSafeExternalHttpUrl(data.applicationUrl);

  if (data.applicationUrl && !safeApplicationUrl) {
    return { success: false, formError: "Application URL must be an absolute http or https URL." };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const slug = data.slug ? slugify(data.slug) : await generateUniqueSlug(data.title, tx, "careerOpening" as any);
      const opening = await tx.careerOpening.create({
        data: {
          title: data.title,
          lang: data.lang,
          slug,
          department: data.department,
          location: data.location,
          employmentType: data.employmentType,
          description: data.description,
          requirements: data.requirements,
          responsibilities: data.responsibilities,
          applicationEmail: data.applicationEmail || null,
          applicationUrl: safeApplicationUrl,
          deadline: data.deadline ? new Date(data.deadline) : null,
          featuredImageId: data.imageId,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          noIndex: data.noIndex,
        }
      });
      if (userId) {
        await tx.auditLog.create({
          data: { userId, entity: "CareerOpening", action: "CREATE_CAREER", entityId: opening.id }
        });
      }
      return opening;
    });
    revalidateCareers(created.slug);
    return { success: true, data: { id: created.id } };
  } catch (err: any) {
    if (err.code === "P2002") return { success: false, formError: "Slug already exists." };
    return { success: false, formError: "Database error during creation." };
  }
}

export async function updateCareerAction(id: string, formData: FormData) {
  await requirePermission(CAREER_PERMISSIONS.MANAGE);
  if (DEMO_MODE) throw new Error("Cannot update careers in demo mode.");

  const rawData = formData.get("data");
  if (!rawData || typeof rawData !== "string") {
    return { success: false, formError: "Invalid payload format" };
  }

  const parsed = CareerPayloadSchema.safeParse(JSON.parse(rawData));
  if (!parsed.success) {
    return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const session = await auth();
  const userId = session?.user?.id;
  const data = parsed.data;
  const safeApplicationUrl = getSafeExternalHttpUrl(data.applicationUrl);

  if (data.applicationUrl && !safeApplicationUrl) {
    return { success: false, formError: "Application URL must be an absolute http or https URL." };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.careerOpening.findUnique({ where: { id } });
      if (!existing) throw new Error("NOT_FOUND");
      const opening = await tx.careerOpening.update({
        where: { id },
        data: {
          title: data.title,
          lang: data.lang,
          slug: existing.status === "OPEN" ? existing.slug : (data.slug ? slugify(data.slug) : existing.slug),
          department: data.department,
          location: data.location,
          employmentType: data.employmentType,
          description: data.description,
          requirements: data.requirements,
          responsibilities: data.responsibilities,
          applicationEmail: data.applicationEmail || null,
          applicationUrl: safeApplicationUrl,
          deadline: data.deadline ? new Date(data.deadline) : null,
          featuredImageId: data.imageId,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          noIndex: data.noIndex,
        }
      });
      if (userId) {
        await tx.auditLog.create({
          data: { userId, entity: "CareerOpening", action: "UPDATE_CAREER", entityId: opening.id }
        });
      }
      return opening;
    });
    revalidateCareers(updated.slug);
    return { success: true };
  } catch (err: any) {
    if (err.code === "P2002") return { success: false, formError: "Slug already exists." };
    return { success: false, formError: "Database error during update." };
  }
}

export async function openCareerAction(id: string) {
  await requirePermission(CAREER_PERMISSIONS.PUBLISH);
  if (DEMO_MODE) throw new Error("Cannot open careers in demo mode.");
  const session = await auth();
  const userId = session?.user?.id;
  const updated = await prisma.$transaction(async (tx) => {
    const opening = await tx.careerOpening.update({ where: { id }, data: { status: CareerOpeningStatus.OPEN } });
    if (userId) await tx.auditLog.create({ data: { userId, entity: "CareerOpening", action: "OPEN_CAREER", entityId: id } });
    return opening;
  });
  revalidateCareers(updated.slug);
  return { success: true };
}

export async function closeCareerAction(id: string) {
  await requirePermission(CAREER_PERMISSIONS.PUBLISH);
  if (DEMO_MODE) throw new Error("Cannot close careers in demo mode.");
  const session = await auth();
  const userId = session?.user?.id;
  const updated = await prisma.$transaction(async (tx) => {
    const opening = await tx.careerOpening.update({ where: { id }, data: { status: CareerOpeningStatus.CLOSED } });
    if (userId) await tx.auditLog.create({ data: { userId, entity: "CareerOpening", action: "CLOSE_CAREER", entityId: id } });
    return opening;
  });
  revalidateCareers(updated.slug);
  return { success: true };
}

export async function archiveCareerAction(id: string) {
  await requirePermission(CAREER_PERMISSIONS.MANAGE);
  if (DEMO_MODE) throw new Error("Cannot archive careers in demo mode.");
  const session = await auth();
  const userId = session?.user?.id;
  const updated = await prisma.$transaction(async (tx) => {
    const opening = await tx.careerOpening.update({
      where: { id },
      data: { status: CareerOpeningStatus.ARCHIVED, deletedAt: new Date() }
    });
    if (userId) await tx.auditLog.create({ data: { userId, entity: "CareerOpening", action: "ARCHIVE_CAREER", entityId: id } });
    return opening;
  });
  revalidateCareers(updated.slug);
  return { success: true };
}

export async function deleteCareerAction(id: string) {
  await requirePermission(CAREER_PERMISSIONS.MANAGE);
  if (DEMO_MODE) throw new Error("Cannot delete careers in demo mode.");
  const session = await auth();
  const userId = session?.user?.id;

  const opening = await prisma.careerOpening.findUnique({ where: { id } });
  if (!opening) throw new Error("Career not found");

  await prisma.$transaction(async (tx) => {
    await tx.careerOpening.delete({ where: { id } });
    if (userId) await tx.auditLog.create({ data: { userId, entity: "CareerOpening", action: "DELETE_CAREER", entityId: id } });
  });

  revalidateCareers(opening.slug);
  return { success: true };
}
