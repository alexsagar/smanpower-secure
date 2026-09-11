import { describe, it, expect, vi, beforeEach } from "vitest";

// Page copy images are flattened to `{ secureUrl }` before any caller sees them,
// so the flattening must resolve R2 delivery — otherwise a migrated asset is
// served from its legacy Cloudinary `fileUrl`.
const getPageBySlug = vi.fn();

vi.mock("@/repositories/content-resolver", () => ({
  getPageBySlug: (slug: string) => getPageBySlug(slug),
}));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: (fn: unknown) => fn };
});

const pageWith = (image: Record<string, unknown>) => ({
  blocks: [{ visible: true, blockType: "page_copy", image }],
});

describe("getPageCopyImage provider resolution", () => {
  beforeEach(() => {
    getPageBySlug.mockReset();
  });

  it("serves an R2 asset from its storageKey, not its legacy Cloudinary url", async () => {
    getPageBySlug.mockResolvedValue(
      pageWith({
        provider: "R2",
        storageKey: "legacy/cloudinary/image/seven-seas-cms/x.webp",
        secureUrl: "https://res.cloudinary.com/o99xd4mq/image/upload/v1/seven-seas-cms/x.webp",
        altText: "Alt",
      })
    );
    const { getPageCopyImage } = await import("./page-copy.service");
    const result = await getPageCopyImage("about/leadership" as never);
    expect(result).toEqual({
      secureUrl: "https://media.smanpower.com/legacy/cloudinary/image/seven-seas-cms/x.webp",
      altText: "Alt",
    });
  });

  it("keeps serving Cloudinary-backed assets from Cloudinary", async () => {
    const url = "https://res.cloudinary.com/o99xd4mq/image/upload/v1/seven-seas-cms/y.webp";
    getPageBySlug.mockResolvedValue(pageWith({ provider: "CLOUDINARY", secureUrl: url, altText: "" }));
    const { getPageCopyImage } = await import("./page-copy.service");
    const result = await getPageCopyImage("about/leadership" as never);
    expect(result?.secureUrl).toBe(url);
  });
});
