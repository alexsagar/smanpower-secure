import { describe, expect, it } from "vitest";
import { resolveMediaUrl, resolvePresetMediaUrl } from "./media-resolver";

describe("Provider Switch Authority", () => {
  const CLOUD_URL = "https://res.cloudinary.com/o99xd4mq/image/upload/v1783515037/test.jpg";
  const KEY = "legacy/cloudinary/image/test.jpg";

  it("provider=CLOUDINARY, storageKey=null -> Cloudinary", () => {
    const res = resolveMediaUrl({ provider: "CLOUDINARY", secureUrl: CLOUD_URL, storageKey: null });
    expect(res).toBe(CLOUD_URL);
  });

  it("provider=CLOUDINARY, storageKey=populated -> Cloudinary", () => {
    const res = resolveMediaUrl({ provider: "CLOUDINARY", secureUrl: CLOUD_URL, storageKey: KEY });
    expect(res).toBe(CLOUD_URL);
  });

  it("provider=R2, storageKey=populated -> R2", () => {
    const res = resolveMediaUrl({ provider: "R2", secureUrl: CLOUD_URL, storageKey: KEY });
    expect(res).toContain("media.smanpower.com/cdn-cgi/image/format=auto,fit=contain,quality=auto/legacy/cloudinary/image/test.jpg");
  });

  it("provider=R2, storageKey=null -> fallback to Cloudinary", () => {
    const res = resolveMediaUrl({ provider: "R2", secureUrl: CLOUD_URL, storageKey: null });
    expect(res).toBe(CLOUD_URL);
  });
});
