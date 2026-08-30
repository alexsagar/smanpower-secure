"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { DEMO_MODE } from "@/config/demo";
import { auth } from "@/lib/auth";
import { NEWS_PERMISSIONS, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug, slugify } from "@/lib/slug";
import { CACHE_TAGS } from "@/lib/cache-tags";

const NewsPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  lang: z.enum(["en", "ne"]).default("en"),
  slug: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  imageId: z.string().nullable().optional(),
  newsType: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  noIndex: z.boolean().default(false),
});

function revalidateNews(slug?: string) {
  revalidatePath("/admin/news");
  revalidatePath("/news");
  if (slug) {
    revalidatePath(`/news/${slug}`);
  }
  revalidateTag(CACHE_TAGS.news, "max");
  revalidateTag(CACHE_TAGS.sitemap, "max");
}


export async function createNewsAction(formData: FormData) {
  await requirePermission(NEWS_PERMISSIONS.MANAGE);
  if (DEMO_MODE) throw new Error("Cannot create news in demo mode.");

  const rawData = formData.get("data");
  if (!rawData || typeof rawData !== "string") {
    return { success: false, formError: "Invalid payload format" };
  }

  const parsed = NewsPayloadSchema.safeParse(JSON.parse(rawData));
  if (!parsed.success) {
    return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const session = await auth();
  const userId = session?.user?.id;
  const data = parsed.data;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const slug = data.slug ? slugify(data.slug) : await generateUniqueSlug(data.title, tx, "newsArticle");
      const article = await tx.newsArticle.create({
        data: {
          title: data.title,
          lang: data.lang,
          slug,
          summary: data.summary,
          content: data.content,
          featuredImageId: data.imageId,
          newsType: data.newsType || null,
          status: ContentStatus.DRAFT,
          isPublished: false,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          noIndex: data.noIndex,
        }
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            entity: "NewsArticle",
            action: "CREATE_NEWS",
            entityId: article.id,
          }
        });
      }

      return article;
    });

    revalidateNews(created.slug);
    return { success: true, data: { id: created.id } };
  } catch (err: any) {
    if (err.code === "P2002") return { success: false, formError: "Slug already exists." };
    return { success: false, formError: "Database error during creation." };
  }
}

export async function updateNewsAction(id: string, formData: FormData) {
  await requirePermission(NEWS_PERMISSIONS.MANAGE);
  if (DEMO_MODE) throw new Error("Cannot update news in demo mode.");

  const rawData = formData.get("data");
  if (!rawData || typeof rawData !== "string") {
    return { success: false, formError: "Invalid payload format" };
  }

  const parsed = NewsPayloadSchema.safeParse(JSON.parse(rawData));
  if (!parsed.success) {
    return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const session = await auth();
  const userId = session?.user?.id;
  const data = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.newsArticle.findUnique({ where: { id } });
      if (!existing) throw new Error("NOT_FOUND");

      const article = await tx.newsArticle.update({
        where: { id },
        data: {
          title: data.title,
          lang: data.lang,
          slug: existing.status === "PUBLISHED" ? existing.slug : (data.slug ? slugify(data.slug) : existing.slug),
          summary: data.summary,
          content: data.content,
          featuredImageId: data.imageId,
          newsType: data.newsType || null,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          noIndex: data.noIndex,
        }
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            entity: "NewsArticle",
            action: "UPDATE_NEWS",
            entityId: article.id,
          }
        });
      }

      return article;
    });

    revalidateNews(updated.slug);
    return { success: true };
  } catch (err: any) {
    if (err.code === "P2002") return { success: false, formError: "Slug already exists." };
    return { success: false, formError: "Database error during update." };
  }
}

export async function publishNewsAction(id: string) {
  await requirePermission(NEWS_PERMISSIONS.PUBLISH);
  if (DEMO_MODE) throw new Error("Cannot publish news in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  const updated = await prisma.$transaction(async (tx) => {
    const article = await tx.newsArticle.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        isPublished: true,
        publishDate: new Date(),
      }
    });
    if (userId) {
      await tx.auditLog.create({
        data: { userId, entity: "NewsArticle", action: "PUBLISH_NEWS", entityId: id }
      });
    }
    return article;
  });

  revalidateNews(updated.slug);
  return { success: true };
}

export async function unpublishNewsAction(id: string) {
  await requirePermission(NEWS_PERMISSIONS.PUBLISH);
  if (DEMO_MODE) throw new Error("Cannot unpublish news in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  const updated = await prisma.$transaction(async (tx) => {
    const article = await tx.newsArticle.update({
      where: { id },
      data: { status: ContentStatus.DRAFT, isPublished: false }
    });
    if (userId) {
      await tx.auditLog.create({
        data: { userId, entity: "NewsArticle", action: "UNPUBLISH_NEWS", entityId: id }
      });
    }
    return article;
  });

  revalidateNews(updated.slug);
  return { success: true };
}

export async function archiveNewsAction(id: string) {
  await requirePermission(NEWS_PERMISSIONS.MANAGE);
  if (DEMO_MODE) throw new Error("Cannot archive news in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  const updated = await prisma.$transaction(async (tx) => {
    const article = await tx.newsArticle.update({
      where: { id },
      data: { status: ContentStatus.ARCHIVED, isPublished: false, deletedAt: new Date() }
    });
    if (userId) {
      await tx.auditLog.create({
        data: { userId, entity: "NewsArticle", action: "ARCHIVE_NEWS", entityId: id }
      });
    }
    return article;
  });

  revalidateNews(updated.slug);
  return { success: true };
}
