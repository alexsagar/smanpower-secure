import { describe, expect, it } from "vitest";
import {
  getAcceptAttributeForPurpose,
  getCloudinaryResourceTypeForPurpose,
  isAllowedMimeTypeForPurpose,
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
