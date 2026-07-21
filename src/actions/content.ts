"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { requirePermission, SETTINGS_PERMISSIONS } from "@/lib/permissions";
import {
  collectReferencedMediaIds,
  normalizeMediaId,
  SavePageValidationError,
  validateBlockMediaPlacement,
  validatePlacedAsset,
  type SaveableBlockInput,
  type SaveableHeroInput,
} from "./content-validation";

export async function savePageAction(
  pageId: string,
  slug: string,
  hero: SaveableHeroInput | null,
  blocks: SaveableBlockInput[]
) {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);

  try {
    const referencedIds = collectReferencedMediaIds(hero, blocks);

    const [page, referencedMedia] = await Promise.all([
      prisma.cmsPage.findUnique({
        where: { id: pageId },
        include: {
          hero: { select: { id: true } },
          blocks: { select: { id: true } },
        },
      }),
      referencedIds.length
        ? prisma.mediaAsset.findMany({
            where: { id: { in: referencedIds } },
            select: {
              id: true,
              isPublic: true,
              status: true,
              resourceType: true,
              deletionState: true,
            },
          })
        : Promise.resolve([]),
    ]);

    if (!page || page.slug !== slug) {
      return { success: false, error: "Page could not be found." };
    }

    const mediaById = new Map(referencedMedia.map((asset) => [asset.id, asset]));
    const knownBlockIds = new Set(page.blocks.map((block) => block.id));

    if (hero) {
      if (!page.hero || page.hero.id !== hero.id) {
        return { success: false, error: "Hero section could not be found." };
      }

      validatePlacedAsset("heroImage", normalizeMediaId(hero.imageId), mediaById);
      validatePlacedAsset("heroVideo", normalizeMediaId(hero.videoId), mediaById);
      validatePlacedAsset("heroPosterImage", normalizeMediaId(hero.posterImageId), mediaById);
      validatePlacedAsset("heroMobileImage", normalizeMediaId(hero.mobileImageId), mediaById);
    }

    for (const block of blocks) {
      if (!knownBlockIds.has(block.id)) {
        throw new SavePageValidationError("One or more page blocks are invalid.");
      }
      validateBlockMediaPlacement(block, mediaById);
    }

    await prisma.$transaction(async (tx) => {
      if (hero) {
        await tx.cmsHeroSection.update({
          where: { id: hero.id },
          data: {
            eyebrow: hero.eyebrow || null,
            richHeading: hero.richHeading as never,
            richDescription: (hero.richDescription || null) as never,
            primaryCtaText: hero.primaryCtaText || null,
            primaryCtaHref: hero.primaryCtaHref || null,
            secondaryCtaText: hero.secondaryCtaText || null,
            secondaryCtaHref: hero.secondaryCtaHref || null,
            imageId: normalizeMediaId(hero.imageId),
            videoId: normalizeMediaId(hero.videoId),
            posterImageId: normalizeMediaId(hero.posterImageId),
            mobileImageId: normalizeMediaId(hero.mobileImageId),
            // Schema default is true; `?? false` silently disabled the overlay
            // for any hero saved before the field was editable.
            overlayEnabled: hero.overlayEnabled ?? true,
            overlayOpacity: hero.overlayOpacity ?? 60,
            accessibilityDescription: hero.accessibilityDescription || null,
          },
        });
      }

      for (let i = 0; i < blocks.length; i += 1) {
        const block = blocks[i];
        await tx.cmsContentBlock.update({
          where: { id: block.id },
          data: {
            content: (block.content || {}) as never,
            richHeading: (block.richHeading || null) as never,
            visible: block.visible ?? true,
            order: i,
            imageId: normalizeMediaId(block.imageId),
            videoId: normalizeMediaId(block.videoId),
            posterImageId: normalizeMediaId(block.posterImageId),
            mobileImageId: normalizeMediaId(block.mobileImageId),
          },
        });
      }
    });

    const publicPath = slug === "home" ? "/" : `/${slug}`;
    revalidatePath(publicPath);
    revalidatePath("/admin/content");

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof SavePageValidationError) {
      return { success: false, error: error.message };
    }

    logger.error(
      "Failed to save page content",
      error instanceof Error ? error : new Error(String(error))
    );
    return { success: false, error: "Failed to save page changes." };
  }
}
