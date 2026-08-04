import { describe, expect, it } from "vitest";
import {
  buildCloudinaryUploadUrl,
  canStartMediaUpload,
  getSafeCloudinaryUploadErrorMessage,
  selectedUploadFiles,
  shouldRefreshAfterMediaUpload,
  uploadProgressLabel,
  uploadSummaryMessage,
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

describe("MediaUploader batch uploads", () => {
  it("does not refresh an editor that handles uploaded assets locally", () => {
    expect(shouldRefreshAfterMediaUpload(1, true)).toBe(false);
    expect(shouldRefreshAfterMediaUpload(1, false)).toBe(true);
    expect(shouldRefreshAfterMediaUpload(0, false)).toBe(false);
  });

  it("reads every picked file, in order", () => {
    const a = new File(["a"], "a.png", { type: "image/png" });
    const b = new File(["b"], "b.png", { type: "image/png" });
    expect(selectedUploadFiles([a, b] as unknown as FileList).map((f) => f.name)).toEqual([
      "a.png",
      "b.png",
    ]);
    expect(selectedUploadFiles(null)).toEqual([]);
  });

  it("keeps the single-file wording unchanged and counts a batch", () => {
    expect(uploadProgressLabel("a.png", 0, 1)).toBe("Uploading a.png...");
    expect(uploadProgressLabel("c.png", 2, 6)).toBe("Uploading c.png (3 of 6)...");
  });

  it("reports partial failure honestly instead of hiding saved files", () => {
    expect(uploadSummaryMessage(["a.png"], [])).toBe("a.png uploaded.");
    expect(uploadSummaryMessage(["a.png", "b.png"], [])).toBe("2 files uploaded.");
    expect(uploadSummaryMessage([], ["a.png"])).toBe("a.png failed.");
    expect(uploadSummaryMessage(["a.png", "b.png"], ["c.png"])).toBe(
      "2 uploaded, 1 failed (c.png)."
    );
  });
});
