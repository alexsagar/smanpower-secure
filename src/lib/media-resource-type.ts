export type AuthoritativeMediaResourceType = "IMAGE" | "VIDEO" | "DOCUMENT";

export type CmsMediaResourceType = "image" | "video" | "document";

export function authoritativeMediaResourceTypeFromMimeType(
  mimeType?: string | null
): AuthoritativeMediaResourceType {
  if (mimeType?.startsWith("image/")) return "IMAGE";
  if (mimeType?.startsWith("video/")) return "VIDEO";
  return "DOCUMENT";
}

export function authoritativeMediaResourceTypeFromCloudinary(
  resourceType: string,
  mimeType?: string | null
): AuthoritativeMediaResourceType {
  if (resourceType === "image") {
    if (mimeType?.startsWith("video/")) {
      throw new Error("Cloudinary image resource type cannot use a video MIME type");
    }
    return "IMAGE";
  }

  if (resourceType === "video") {
    if (mimeType?.startsWith("image/")) {
      throw new Error("Cloudinary video resource type cannot use an image MIME type");
    }
    return "VIDEO";
  }

  if (resourceType === "raw") {
    if (mimeType?.startsWith("image/") || mimeType?.startsWith("video/")) {
      throw new Error("Cloudinary raw resource type cannot use image or video MIME types");
    }
    return "DOCUMENT";
  }

  throw new Error("Unsupported Cloudinary resource type");
}

export function cmsMediaResourceTypeFromAuthoritative(
  resourceType: AuthoritativeMediaResourceType
): CmsMediaResourceType {
  if (resourceType === "IMAGE") return "image";
  if (resourceType === "VIDEO") return "video";
  return "document";
}

export function cloudinaryDestroyResourceTypeFromAuthoritative(
  resourceType: AuthoritativeMediaResourceType
): "image" | "video" | "raw" {
  if (resourceType === "IMAGE") return "image";
  if (resourceType === "VIDEO") return "video";
  return "raw";
}
