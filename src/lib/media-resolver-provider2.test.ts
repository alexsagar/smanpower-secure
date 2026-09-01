import { describe, expect, it } from "vitest";
import { resolveMediaUrl, resolvePresetMediaUrl } from "./media-resolver";

describe("Provider Switch Authority", () => {
  const CLOUD_URL = "https://res.cloudinary.com/o99xd4mq/image/upload/v1783515037/test.jpg";
  const KEY = "legacy/cloudinary/image/test.jpg";

  it("provider=R2, storageKey=populated -> R2 (No preset)", () => {
    const res = resolveMediaUrl({ provider: "R2", secureUrl: CLOUD_URL, storageKey: KEY });
    expect(res).toBe("https://media.smanpower.com/legacy/cloudinary/image/test.jpg");
  });

  it("provider=R2, storageKey=populated -> R2 (With preset)", () => {
    const res = resolvePresetMediaUrl({ provider: "R2", secureUrl: CLOUD_URL, storageKey: KEY }, "avatar");
    expect(res).toContain("media.smanpower.com/cdn-cgi/image/");
  });
});
