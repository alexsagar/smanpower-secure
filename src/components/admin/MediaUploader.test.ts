import { describe, expect, it } from "vitest";
import {
  buildCloudinaryUploadUrl,
  canStartMediaUpload,
  getSafeCloudinaryUploadErrorMessage,
} from "./MediaUploader";

describe("MediaUploader duplicate guard", () => {
  it("prevents duplicate upload starts while an upload is active", () => {
    const file = new File(["pdf"], "certificate.pdf", { type: "application/pdf" });

    expect(canStartMediaUpload(false, file)).toBe(true);
    expect(canStartMediaUpload(true, file)).toBe(false);
    expect(canStartMediaUpload(false, null)).toBe(false);
  });
});

describe("MediaUploader Cloudinary upload endpoint", () => {
  it("builds the upload URL from the signed response resource type", () => {
    expect(
      buildCloudinaryUploadUrl({
        cloudName: "test-cloud",
        apiKey: "public-key",
        timestamp: 123,
        signature: "signed",
        folder: "seven-seas-cms",
        resourceType: "image",
      })
    ).toBe("https://api.cloudinary.com/v1_1/test-cloud/image/upload");
  });

  it("does not independently override a signed video resource type", () => {
    expect(
      buildCloudinaryUploadUrl({
        cloudName: "test-cloud",
        apiKey: "public-key",
        timestamp: 123,
        signature: "signed",
        folder: "seven-seas-cms",
        resourceType: "video",
      })
    ).toBe("https://api.cloudinary.com/v1_1/test-cloud/video/upload");
  });

  it("returns a safe useful message for Cloudinary 401 responses", async () => {
    const response = new Response(
      JSON.stringify({ error: { message: "Invalid Signature" } }),
      { status: 401 }
    );

    await expect(getSafeCloudinaryUploadErrorMessage(response)).resolves.toBe(
      "Cloudinary upload failed: Invalid Signature"
    );
  });
});
