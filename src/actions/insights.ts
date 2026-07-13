"use server";

import { requirePermission, INSIGHT_PERMISSIONS } from "@/lib/permissions";
import { DEMO_MODE } from "@/config/demo";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { generateUniqueSlug } from "@/lib/slug";
import { auth } from "@/lib/auth";

import { ContentStatus } from "@prisma/client";

const InsightPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  lang: z.enum(["en", "ne"]).default("en"),
  summary: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  imageId: z.string().nullable().optional(),
  authorId: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  
  // SEO fields
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  noIndex: z.boolean().default(false),
  
  updatedAt: z.string().optional(),
});

function revalidateInsightCaches(slug?: string) {
  revalidatePath("/admin/insights", "page");
  revalidatePath("/[lang]/insights", "page");
  if (slug) {
    revalidatePath(`/[lang]/insights/${slug}`, "page");
    // @ts-expect-error Next.js 16 signature issue
    revalidateTag(`insight:${slug}`);
  }
  // @ts-expect-error Next.js 16 signature issue
  revalidateTag("insights:list");
}

export async function createInsightAction(formData: FormData) {
  await requirePermission(INSIGHT_PERMISSIONS.CREATE);
  if (DEMO_MODE) throw new Error("Cannot create insights in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const rawData = formData.get("data");
    if (!rawData || typeof rawData !== "string") {
      return { success: false, formError: "Invalid payload format" };
    }

    const parsedJson = JSON.parse(rawData);
    const parsed = InsightPayloadSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;

    let resultInsight;
    let retries = 5;

    while (retries > 0) {
      try {
        resultInsight = await prisma.$transaction(async (tx) => {
          let slug = data.slug ? data.slug.trim().toLowerCase().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") : null;
          
          if (!slug) {
            slug = await generateUniqueSlug(data.title, tx, "insightArticle");
          }

          const created = await tx.insightArticle.create({
            data: {
              slug,
              lang: data.lang,
              title: data.title,
              summary: data.summary,
              content: data.content,
              isFeatured: data.featured,
              featuredImageId: data.imageId,
              authorId: data.authorId,
              status: ContentStatus.DRAFT,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              canonicalUrl: data.canonicalUrl,
              ogImage: data.ogImage,
              noIndex: data.noIndex,
            }
          });

          if (userId) {
            await tx.auditLog.create({
              data: {
                userId,
                entity: "InsightArticle",
                action: "CREATE_INSIGHT",
                entityId: created.id,
                details: `Created new insight: ${created.title}`
              }
            });
          }

          return created;
        });

        break;
      } catch (err: any) {
        if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
          if (data.slug) {
            return { success: false, formError: "The provided custom slug is already in use. Please choose another." };
          }
          retries--;
          if (retries === 0) {
            return { success: false, formError: "Could not generate a unique slug. Please modify the title slightly." };
          }
        } else {
          console.error("Insight create error:", err);
          return { success: false, formError: "Database error during creation." };
        }
      }
    }

    revalidateInsightCaches(resultInsight?.slug);
    return { success: true, data: { id: resultInsight?.id, slug: resultInsight?.slug } };

  } catch (err: any) {
    console.error("Insight creation payload error:", err);
    return { success: false, formError: "Invalid request payload." };
  }
}

export async function updateInsightAction(id: string, formData: FormData) {
  await requirePermission(INSIGHT_PERMISSIONS.UPDATE);
  if (DEMO_MODE) throw new Error("Cannot update insights in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const rawData = formData.get("data");
    if (!rawData || typeof rawData !== "string") {
      return { success: false, formError: "Invalid payload format" };
    }

    const parsedJson = JSON.parse(rawData);
    const parsed = InsightPayloadSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.insightArticle.findUnique({
        where: { id }
      });

      if (!existing) throw new Error("NOT_FOUND");

      let updatedSlug = existing.slug;
      if (data.slug && existing.status !== "PUBLISHED") {
         updatedSlug = data.slug.trim().toLowerCase().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
      }

      const updated = await tx.insightArticle.update({
        where: { id },
        data: {
          slug: updatedSlug,
          lang: data.lang,
          title: data.title,
          summary: data.summary,
          content: data.content,
          isFeatured: data.featured,
          featuredImageId: data.imageId,
          authorId: data.authorId,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          canonicalUrl: data.canonicalUrl,
          ogImage: data.ogImage,
          noIndex: data.noIndex,
        }
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            entity: "InsightArticle",
            action: "UPDATE_INSIGHT",
            entityId: id,
            details: "Updated insight details"
          }
        });
      }

      return updated;
    });

    revalidateInsightCaches(result.slug);
    return { success: true, data: { id: result.id, slug: result.slug } };

  } catch (err: any) {
    if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
      return { success: false, formError: "The provided custom slug is already in use. Please choose another." };
    }
    console.error("Insight update error:", err);
    return { success: false, formError: "Database error during update." };
  }
}

export async function publishInsightAction(id: string) {
  await requirePermission(INSIGHT_PERMISSIONS.PUBLISH);
  if (DEMO_MODE) throw new Error("Cannot modify insights in demo mode.");

  const session = await auth();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.insightArticle.findUnique({ where: { id } });
    if (!existing) throw new Error("NOT_FOUND");
    
    if (existing.status !== ContentStatus.DRAFT && existing.status !== ContentStatus.ARCHIVED) {
      throw new Error("Only DRAFT or ARCHIVED insights can be published.");
    }

    const updated = await tx.insightArticle.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishDate: new Date(),
      }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "InsightArticle",
          action: "PUBLISH_INSIGHT",
          entityId: id,
          details: "Published insight"
        }
      });
    }

    return updated;
  });

  revalidateInsightCaches(result.slug);
  return { success: true };
}

export async function unpublishInsightAction(id: string) {
  await requirePermission(INSIGHT_PERMISSIONS.PUBLISH);
  if (DEMO_MODE) throw new Error("Cannot modify insights in demo mode.");

  const session = await auth();

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.insightArticle.update({
      where: { id },
      data: {
        status: ContentStatus.DRAFT,
      }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "InsightArticle",
          action: "UNPUBLISH_INSIGHT",
          entityId: id,
          details: "Unpublished insight"
        }
      });
    }

    return updated;
  });

  revalidateInsightCaches(result.slug);
  return { success: true };
}

export async function archiveInsightAction(id: string) {
  await requirePermission(INSIGHT_PERMISSIONS.DELETE_OR_ARCHIVE);
  if (DEMO_MODE) throw new Error("Cannot archive insights in demo mode.");

  const session = await auth();

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.insightArticle.update({
      where: { id },
      data: { 
        status: ContentStatus.ARCHIVED,
        deletedAt: new Date(),
      }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "InsightArticle",
          action: "ARCHIVE_INSIGHT",
          entityId: id,
          details: "Archived insight"
        }
      });
    }

    return updated;
  });

  revalidateInsightCaches(result.slug);
  return { success: true };
}
