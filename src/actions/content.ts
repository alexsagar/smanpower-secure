"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { requirePermission, SETTINGS_PERMISSIONS } from "@/lib/permissions";
import {
  CMS_MEDIA_FIELDS,
  getCmsMediaFieldDefinition,
  isRenderablePublicCmsMedia,
  type CmsMediaFieldName,
} from "@/lib/cms-media";

type SaveableHeroInput = {
  id: string;
  eyebrow?: string | null;
  richHeading: unknown;
  richDescription?: unknown;
  primaryCtaText?: string | null;
  primaryCtaHref?: string | null;
  secondaryCtaText?: string | null;
  secondaryCtaHref?: string | null;
  imageId?: string | null;
  videoId?: string | null;
  posterImageId?: string | null;
  mobileImageId?: string | null;
  overlayEnabled?: boolean;
  overlayOpacity?: number | null;
};

type SaveableBlockInput = {
  id: string;
  blockType: string;
  content?: unknown;
  richHeading?: unknown;
  visible?: boolean;
  order?: number;
  imageId?: string | null;
  videoId?: string | null;
  posterImageId?: string | null;
  mobileImageId?: string | null;
};

class SavePageValidationError extends Error {}

const SUPPORTED_VIDEO_BLOCK_TYPES = new Set(["image_text", "introduction"]);

function normalizeMediaId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function collectReferencedMediaIds(
  hero: SaveableHeroInput | null | undefined,
  blocks: SaveableBlockInput[]
) {
  const ids = new Set<string>();

  if (hero) {
    for (const value of [
      hero.imageId,
      hero.videoId,
      hero.posterImageId,
      hero.mobileImageId,
    ]) {
      const normalized = normalizeMediaId(value);
      if (normalized) ids.add(normalized);
    }
  }

  for (const block of blocks) {
    for (const value of [
      block.imageId,
      block.videoId,
      block.posterImageId,
      block.mobileImageId,
    ]) {
      const normalized = normalizeMediaId(value);
      if (normalized) ids.add(normalized);
    }
  }

  return Array.from(ids);
}

function validatePlacedAsset(
  fieldName: CmsMediaFieldName,
  mediaId: string | null,
  mediaById: Map<
    string,
    {
      id: string;
      isPublic: boolean;
      status: "AI_PLACEHOLDER" | "REAL_APPROVED" | "STOCK_LICENCED" | "PRIVATE_INTERNAL";
      resourceType: "IMAGE" | "VIDEO" | "DOCUMENT";
      deletionState: "ACTIVE" | "PENDING_REMOTE_DELETE" | "REMOTE_DELETE_FAILED" | "REMOTE_DELETED";
    }
  >
) {
  if (!mediaId) return;

  const asset = mediaById.get(mediaId);
  const definition = getCmsMediaFieldDefinition(fieldName);

  if (!asset) {
    throw new SavePageValidationError(`${definition.label} does not exist.`);
  }

  if (!isRenderablePublicCmsMedia(asset)) {
    throw new SavePageValidationError(`${definition.label} is not approved for public placement.`);
  }

  if (asset.resourceType !== definition.allowedResourceType) {
    throw new SavePageValidationError(`${definition.label} has the wrong media type.`);
  }
}

function validateBlockMediaPlacement(
  block: SaveableBlockInput,
  mediaById: Map<
    string,
    {
      id: string;
      isPublic: boolean;
      status: "AI_PLACEHOLDER" | "REAL_APPROVED" | "STOCK_LICENCED" | "PRIVATE_INTERNAL";
      resourceType: "IMAGE" | "VIDEO" | "DOCUMENT";
      deletionState: "ACTIVE" | "PENDING_REMOTE_DELETE" | "REMOTE_DELETE_FAILED" | "REMOTE_DELETED";
    }
  >
) {
  validatePlacedAsset("blockImage", normalizeMediaId(block.imageId), mediaById);

  const videoId = normalizeMediaId(block.videoId);
  const posterImageId = normalizeMediaId(block.posterImageId);
  const mobileImageId = normalizeMediaId(block.mobileImageId);

  if ((videoId || posterImageId || mobileImageId) && !SUPPORTED_VIDEO_BLOCK_TYPES.has(block.blockType)) {
    throw new SavePageValidationError("Selected block type does not support managed video media.");
  }

  validatePlacedAsset("blockVideo", videoId, mediaById);
  validatePlacedAsset("blockPosterImage", posterImageId, mediaById);
  validatePlacedAsset("blockMobileImage", mobileImageId, mediaById);
}

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
            overlayEnabled: hero.overlayEnabled ?? false,
            overlayOpacity: hero.overlayOpacity ?? 60,
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

export const __testables__ = {
  collectReferencedMediaIds,
  validateBlockMediaPlacement,
  validatePlacedAsset,
  SUPPORTED_VIDEO_BLOCK_TYPES,
  CMS_MEDIA_FIELDS,
};
