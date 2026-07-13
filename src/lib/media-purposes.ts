import { MEDIA_PERMISSIONS } from "./permissions";

export type MediaPurpose = 
  | "cms_image"
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
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_WIDTH = 4000;
const MAX_IMAGE_HEIGHT = 4000;

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
