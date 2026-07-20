import {
  getCmsMediaFieldDefinition,
  isRenderablePublicCmsMedia,
  type CmsMediaFieldName,
} from "@/lib/cms-media";

export type SaveableHeroInput = {
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

export type SaveableBlockInput = {
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

type MediaPlacementRecord = {
  id: string;
  isPublic: boolean;
  status: "AI_PLACEHOLDER" | "REAL_APPROVED" | "STOCK_LICENCED" | "PRIVATE_INTERNAL";
  resourceType: "IMAGE" | "VIDEO" | "DOCUMENT";
  deletionState: "ACTIVE" | "PENDING_REMOTE_DELETE" | "REMOTE_DELETE_FAILED" | "REMOTE_DELETED";
};

export class SavePageValidationError extends Error {}

export const SUPPORTED_VIDEO_BLOCK_TYPES = new Set(["image_text", "introduction"]);

export function normalizeMediaId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function collectReferencedMediaIds(
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

export function validatePlacedAsset(
  fieldName: CmsMediaFieldName,
  mediaId: string | null,
  mediaById: Map<string, MediaPlacementRecord>
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

export function validateBlockMediaPlacement(
  block: SaveableBlockInput,
  mediaById: Map<string, MediaPlacementRecord>
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
