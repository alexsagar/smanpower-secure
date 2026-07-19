import { describe, expect, it } from "vitest";
import { canStartMediaUpload } from "./MediaUploader";

describe("MediaUploader duplicate guard", () => {
  it("prevents duplicate upload starts while an upload is active", () => {
    const file = new File(["pdf"], "certificate.pdf", { type: "application/pdf" });

    expect(canStartMediaUpload(false, file)).toBe(true);
    expect(canStartMediaUpload(true, file)).toBe(false);
    expect(canStartMediaUpload(false, null)).toBe(false);
  });
});
