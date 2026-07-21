import { describe, expect, it } from "vitest";
import {
  getAcceptAttributeForPurpose,
  getCloudinaryResourceTypeForPurpose,
  isAllowedMimeTypeForPurpose,
  cloudinaryMimeType,
} from "./media-purposes";

describe("media purpose resource mapping", () => {
  it("resolves cms_image to the Cloudinary image resource type", () => {
    expect(getCloudinaryResourceTypeForPurpose("cms_image")).toBe("image");
    expect(getCloudinaryResourceTypeForPurpose("cms_image")).not.toBe("video");
  });

  it("accepts only image MIME types for cms_image", () => {
    expect(isAllowedMimeTypeForPurpose("cms_image", "image/jpeg")).toBe(true);
    expect(isAllowedMimeTypeForPurpose("cms_image", "image/png")).toBe(true);
    expect(isAllowedMimeTypeForPurpose("cms_image", "video/mp4")).toBe(false);
    expect(isAllowedMimeTypeForPurpose("cms_image", "application/pdf")).toBe(false);
  });

  it("keeps video purposes mapped to video", () => {
    expect(getCloudinaryResourceTypeForPurpose("cms_video")).toBe("video");
    expect(getAcceptAttributeForPurpose("cms_video")).toContain("video/mp4");
  });
});

describe("cloudinaryMimeType", () => {
  // Cloudinary reports JPEGs as "jpg"; naive concatenation produced the
  // non-existent "image/jpg" and 400'd every JPEG upload with
  // "Unsupported media type".
  it("maps Cloudinary's jpg format to the real image/jpeg MIME type", () => {
    expect(cloudinaryMimeType("image", "jpg")).toBe("image/jpeg");
    expect(isAllowedMimeTypeForPurpose("demand_image", cloudinaryMimeType("image", "jpg"))).toBe(true);
  });

  it("keeps formats whose name already matches the MIME subtype", () => {
    expect(cloudinaryMimeType("image", "png")).toBe("image/png");
    expect(cloudinaryMimeType("image", "webp")).toBe("image/webp");
    expect(cloudinaryMimeType("video", "mp4")).toBe("video/mp4");
  });

  it("accepts every allowed image format for demand uploads", () => {
    for (const format of ["jpg", "jpeg", "png", "webp"]) {
      expect(isAllowedMimeTypeForPurpose("demand_image", cloudinaryMimeType("image", format))).toBe(true);
    }
  });

  it("leaves unknown formats unmapped so they stay rejected", () => {
    expect(isAllowedMimeTypeForPurpose("demand_image", cloudinaryMimeType("image", "svg"))).toBe(false);
    expect(isAllowedMimeTypeForPurpose("demand_image", cloudinaryMimeType("video", "mp4"))).toBe(false);
  });
});
