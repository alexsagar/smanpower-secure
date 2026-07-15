import type { MediaAsset, MediaDeletionState, MediaStatus } from "@prisma/client";
import type { AuthoritativeMediaResourceType } from "@/lib/media-resource-type";
import type { MediaPurpose } from "@/lib/media-purposes";

export const CMS_MEDIA_FIELDS = {
  heroImage: {
    purpose: "cms_image",
    allowedResourceType: "IMAGE",
    label: "Hero image",
  },
  heroVideo: {
    purpose: "cms_video",
    allowedResourceType: "VIDEO",
    label: "Hero video",
  },
  heroPosterImage: {
    purpose: "cms_poster_image",
    allowedResourceType: "IMAGE",
    label: "Hero poster image",
  },
  heroMobileImage: {
    purpose: "cms_mobile_image",
    allowedResourceType: "IMAGE",
    label: "Hero mobile fallback image",
  },
  blockImage: {
    purpose: "cms_image",
    allowedResourceType: "IMAGE",
    label: "Block image",
  },
  blockVideo: {
    purpose: "cms_video",
    allowedResourceType: "VIDEO",
    label: "Block video",
  },
  blockPosterImage: {
    purpose: "cms_poster_image",
    allowedResourceType: "IMAGE",
    label: "Block poster image",
  },
  blockMobileImage: {
    purpose: "cms_mobile_image",
    allowedResourceType: "IMAGE",
    label: "Block mobile fallback image",
  },
} as const satisfies Record<
  string,
  {
    purpose: MediaPurpose;
    allowedResourceType: AuthoritativeMediaResourceType;
    label: string;
  }
>;

export type CmsMediaFieldName = keyof typeof CMS_MEDIA_FIELDS;

export const PUBLIC_CMS_MEDIA_STATUSES: MediaStatus[] = [
  "AI_PLACEHOLDER",
  "REAL_APPROVED",
  "STOCK_LICENCED",
];

export const ACTIVE_MEDIA_DELETION_STATE: MediaDeletionState = "ACTIVE";

export type CmsAttachableMediaAsset = Pick<
  MediaAsset,
  "id" | "isPublic" | "status" | "resourceType" | "deletionState"
>;

export function isRenderablePublicCmsMedia(
  asset: CmsAttachableMediaAsset
): boolean {
  return (
    asset.isPublic &&
    asset.deletionState === ACTIVE_MEDIA_DELETION_STATE &&
    PUBLIC_CMS_MEDIA_STATUSES.includes(asset.status)
  );
}

export function getCmsMediaFieldDefinition(field: CmsMediaFieldName) {
  return CMS_MEDIA_FIELDS[field];
}

export function getAllowedMediaResourceTypesForField(
  field: CmsMediaFieldName
): AuthoritativeMediaResourceType[] {
  return [CMS_MEDIA_FIELDS[field].allowedResourceType];
}
