"use server";

import { requirePermission, SUCCESS_STORY_PERMISSIONS } from "@/lib/permissions";
import { DEMO_MODE } from "@/config/demo";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { generateUniqueSlug } from "@/lib/slug";
import { auth } from "@/lib/auth";

import { ContentStatus, StoryType } from "@prisma/client";

const SuccessStoryPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  storyType: z.nativeEnum(StoryType).default(StoryType.CANDIDATE),
  summary: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  quote: z.string().nullable().optional(),
  personName: z.string().nullable().optional(),
  showPersonName: z.boolean().default(false),
  country: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  imageId: z.string().nullable().optional(),
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

function revalidateStoryCaches(slug?: string) {
  revalidatePath("/admin/success-stories", "page");
  revalidatePath("/success-stories", "page");
  revalidatePath("/", "page"); // homepage story_grid shows the featured/latest stories
  if (slug) {
    revalidatePath(`/success-stories/${slug}`, "page");
    // @ts-expect-error Next.js 16 signature issue
    revalidateTag(`story:${slug}`);
  }
  // @ts-expect-error Next.js 16 signature issue
  revalidateTag("stories:list");
}

export async function createStoryAction(formData: FormData) {
  await requirePermission(SUCCESS_STORY_PERMISSIONS.CREATE);
  if (DEMO_MODE) throw new Error("Cannot create stories in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const rawData = formData.get("data");
    if (!rawData || typeof rawData !== "string") {
      return { success: false, formError: "Invalid payload format" };
    }

    const parsedJson = JSON.parse(rawData);
    const parsed = SuccessStoryPayloadSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;

    let resultStory;
    let retries = 5;

    while (retries > 0) {
      try {
        resultStory = await prisma.$transaction(async (tx) => {
          let slug = data.slug ? data.slug.trim().toLowerCase().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") : null;
          
          if (!slug) {
            slug = await generateUniqueSlug(data.title, tx, "successStory");
          }

          const created = await tx.successStory.create({
            data: {
              slug,
              title: data.title,
              storyType: data.storyType,
              summary: data.summary,
              content: data.content,
              quote: data.quote,
              personName: data.personName,
              showPersonName: data.showPersonName,
              countryId: data.country,
              industryId: data.industry,
              isFeatured: data.featured,
              featuredImageId: data.imageId,
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
                entity: "SuccessStory",
                action: "CREATE_STORY",
                entityId: created.id,
                details: `Created new story: ${created.title}`
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
          console.error("Story create error:", err);
          return { success: false, formError: "Database error during creation." };
        }
      }
    }

    revalidateStoryCaches(resultStory?.slug);
    return { success: true, data: { id: resultStory?.id, slug: resultStory?.slug } };

  } catch (err: any) {
    console.error("Story creation payload error:", err);
    return { success: false, formError: "Invalid request payload." };
  }
}

export async function updateStoryAction(id: string, formData: FormData) {
  await requirePermission(SUCCESS_STORY_PERMISSIONS.UPDATE);
  if (DEMO_MODE) throw new Error("Cannot update stories in demo mode.");

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const rawData = formData.get("data");
    if (!rawData || typeof rawData !== "string") {
      return { success: false, formError: "Invalid payload format" };
    }

    const parsedJson = JSON.parse(rawData);
    const parsed = SuccessStoryPayloadSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { success: false, formError: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.successStory.findUnique({
        where: { id }
      });

      if (!existing) throw new Error("NOT_FOUND");

      let updatedSlug = existing.slug;
      if (data.slug && existing.status !== "PUBLISHED") {
         updatedSlug = data.slug.trim().toLowerCase().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
      }

      const updated = await tx.successStory.update({
        where: { id },
        data: {
          slug: updatedSlug,
          title: data.title,
          storyType: data.storyType,
          summary: data.summary,
          content: data.content,
          quote: data.quote,
          personName: data.personName,
          showPersonName: data.showPersonName,
          countryId: data.country,
          industryId: data.industry,
          isFeatured: data.featured,
          featuredImageId: data.imageId,
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
            entity: "SuccessStory",
            action: "UPDATE_STORY",
            entityId: id,
            details: "Updated story details"
          }
        });
      }

      return updated;
    });

    revalidateStoryCaches(result.slug);
    return { success: true, data: { id: result.id, slug: result.slug } };

  } catch (err: any) {
    if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
      return { success: false, formError: "The provided custom slug is already in use. Please choose another." };
    }
    console.error("Story update error:", err);
    return { success: false, formError: "Database error during update." };
  }
}

export async function publishStoryAction(id: string) {
  await requirePermission(SUCCESS_STORY_PERMISSIONS.UPDATE);
  if (DEMO_MODE) throw new Error("Cannot modify stories in demo mode.");

  const session = await auth();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.successStory.findUnique({ where: { id } });
    if (!existing) throw new Error("NOT_FOUND");
    
    if (existing.status !== ContentStatus.DRAFT && existing.status !== ContentStatus.ARCHIVED) {
      throw new Error("Only DRAFT or ARCHIVED stories can be published.");
    }

    const updated = await tx.successStory.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "SuccessStory",
          action: "PUBLISH_STORY",
          entityId: id,
          details: "Published story"
        }
      });
    }

    return updated;
  });

  revalidateStoryCaches(result.slug);
  return { success: true };
}

export async function unpublishStoryAction(id: string) {
  await requirePermission(SUCCESS_STORY_PERMISSIONS.UPDATE);
  if (DEMO_MODE) throw new Error("Cannot modify stories in demo mode.");

  const session = await auth();

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.successStory.update({
      where: { id },
      data: {
        status: ContentStatus.DRAFT,
      }
    });

    if (session?.user?.id) {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "SuccessStory",
          action: "UNPUBLISH_STORY",
          entityId: id,
          details: "Unpublished story"
        }
      });
    }

    return updated;
  });

  revalidateStoryCaches(result.slug);
  return { success: true };
}

export async function archiveStoryAction(id: string) {
  await requirePermission(SUCCESS_STORY_PERMISSIONS.DELETE_OR_ARCHIVE);
  if (DEMO_MODE) throw new Error("Cannot archive stories in demo mode.");

  const session = await auth();

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.successStory.update({
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
          entity: "SuccessStory",
          action: "ARCHIVE_STORY",
          entityId: id,
          details: "Archived story"
        }
      });
    }

    return updated;
  });

  revalidateStoryCaches(result.slug);
  return { success: true };
}
