import { MEDIA_PERMISSIONS } from "./permissions.constants";

export type MediaPurpose = 
  | "cms_image"
  | "cms_video"
  | "cms_poster_image"
  | "cms_mobile_image"
  | "news_image"
  | "insight_image"
  | "demand_image"
  | "career_image"
  | "partner_logo"
  | "training_media";

export interface MediaPurposeConfig {
  permission: string;
  folder: string;
  prefix: string;
  resourceType: "image" | "video" | "raw";
  deliveryType: "upload" | "private";
  allowedFormats: string[];
  maxBytes: number;
  maxWidth?: number;
  maxHeight?: number;
  isPublic: boolean;
}

const COMMON_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const COMMON_VIDEO_FORMATS = ["mp4", "webm"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_WIDTH = 4000;
const MAX_IMAGE_HEIGHT = 4000;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

const FORMAT_MIME_TYPES: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  mp4: ["video/mp4"],
  webm: ["video/webm"],
  pdf: ["application/pdf"],
};

export const MEDIA_PURPOSE_MAP: Record<MediaPurpose, MediaPurposeConfig> = {
  cms_image: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-cms",
    prefix: "cms_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  },
  cms_video: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-cms",
    prefix: "cms_video_",
    resourceType: "video",
    deliveryType: "upload",
    allowedFormats: COMMON_VIDEO_FORMATS,
    maxBytes: MAX_VIDEO_BYTES,
    isPublic: true,
  },
  cms_poster_image: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-cms",
    prefix: "cms_poster_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  },
  cms_mobile_image: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-cms",
    prefix: "cms_mobile_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  },
  news_image: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-news",
    prefix: "news_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  },
  insight_image: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-insights",
    prefix: "insight_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  },
  demand_image: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-demands",
    prefix: "demand_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  },
  career_image: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-careers",
    prefix: "career_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  },
  partner_logo: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-partners",
    prefix: "partner_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS, // SVG specifically excluded per Phase 6 requirements
    maxBytes: 2 * 1024 * 1024, // 2 MB
    maxWidth: 2000,
    maxHeight: 2000,
    isPublic: true,
  },
  training_media: {
    permission: MEDIA_PERMISSIONS.UPLOAD,
    folder: "seven-seas-training",
    prefix: "training_",
    resourceType: "image",
    deliveryType: "upload",
    allowedFormats: COMMON_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
    isPublic: true,
  }
};

export function getAllowedMimeTypesForPurpose(purpose: MediaPurpose): string[] {
  const config = MEDIA_PURPOSE_MAP[purpose];

  return Array.from(
    new Set(
      config.allowedFormats.flatMap((format) => FORMAT_MIME_TYPES[format] || [])
    )
  );
}

export function getAcceptAttributeForPurpose(purpose: MediaPurpose): string {
  return getAllowedMimeTypesForPurpose(purpose).join(",");
}

export function getCloudinaryResourceTypeForPurpose(
  purpose: MediaPurpose
): "image" | "video" | "raw" {
  return MEDIA_PURPOSE_MAP[purpose].resourceType;
}

export function isCloudinaryResourceTypeAllowedForPurpose(
  purpose: MediaPurpose,
  resourceType?: string | null
): boolean {
  return resourceType === getCloudinaryResourceTypeForPurpose(purpose);
}

export function getNormalizedExtension(value?: string | null): string | null {
  if (!value) return null;

  const candidate = value.trim().toLowerCase();
  const normalized = candidate.startsWith(".") ? candidate.slice(1) : candidate;

  return normalized.length > 0 ? normalized : null;
}

export function getFileExtension(fileName?: string | null): string | null {
  if (!fileName) return null;

  const parts = fileName.toLowerCase().split(".");
  if (parts.length < 2) return null;

  return getNormalizedExtension(parts.at(-1) || null);
}

export function isAllowedMimeTypeForPurpose(
  purpose: MediaPurpose,
  mimeType?: string | null
): boolean {
  if (!mimeType) return false;
  return getAllowedMimeTypesForPurpose(purpose).includes(mimeType.toLowerCase());
}

export function isAllowedExtensionForPurpose(
  purpose: MediaPurpose,
  extension?: string | null
): boolean {
  const normalized = getNormalizedExtension(extension);
  if (!normalized) return false;
  return MEDIA_PURPOSE_MAP[purpose].allowedFormats.includes(normalized);
}
