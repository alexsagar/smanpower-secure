import { describe, expect, it } from "vitest";
import { resolveOpenGraphImageUrl, resolvePresetMediaUrl } from "./media-resolver";

const IMG = "https://res.cloudinary.com/demo/image/upload/v1/seven-seas-cms/story.jpg";

describe("resolvePresetMediaUrl", () => {
  it("bakes the preset box for a fixed-size placement", () => {
    expect(resolvePresetMediaUrl(IMG, "successStoryCard")).toContain("c_fill,w_720,h_480");
  });

  it("omits the box when the layout crops, so the subject is not cropped twice", () => {
    // The card renders this with fill + object-cover. Cropping in both places
    // zoomed the people in the success-story cards.
    const url = resolvePresetMediaUrl(IMG, "successStoryCard", { fill: true })!;
    expect(url).toContain("c_limit,w_720");
    expect(url).not.toContain("c_fill");
    expect(url).not.toContain("h_480");
    expect(url).not.toContain("g_auto");
  });

  it("keeps a real 1200x630 crop for social cards, which never render with fill", () => {
    expect(resolveOpenGraphImageUrl(IMG)).toContain("c_fill,w_1200,h_630");
  });

  it("returns undefined for a missing asset rather than a placeholder URL", () => {
    expect(resolvePresetMediaUrl(null, "articleCard")).toBeUndefined();
    expect(resolvePresetMediaUrl(undefined, "articleCard")).toBeUndefined();
  });

  it("passes non-Cloudinary sources through untouched", () => {
    expect(resolvePresetMediaUrl("https://example.com/a.jpg", "articleCard")).toBe(
      "https://example.com/a.jpg"
    );
  });

  it("handles R2 media correctly", () => {
    const r2Asset = { provider: "R2" as const, storageKey: "legacy/cloudinary/image/seven-seas-cms/asset.jpg" };
    expect(resolvePresetMediaUrl(r2Asset, "articleCard")).toBe(
      "https://media.smanpower.com/cdn-cgi/image/format=auto,width=720,height=420,fit=cover,gravity=auto,quality=85/legacy/cloudinary/image/seven-seas-cms/asset.jpg"
    );
  });

  it("handles LOCAL media correctly", () => {
    const localAsset = { provider: "LOCAL" as const, fileUrl: "/images/SSIS.png" };
    expect(resolvePresetMediaUrl(localAsset, "articleCard")).toBe("/images/SSIS.png");
  });
});
