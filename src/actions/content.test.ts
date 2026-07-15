import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const requirePermission = vi.fn();

const tx = {
  cmsHeroSection: {
    update: vi.fn(),
  },
  cmsContentBlock: {
    update: vi.fn(),
  },
};

const prisma = {
  cmsPage: {
    findUnique: vi.fn(),
  },
  mediaAsset: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/prisma", () => ({
  prisma,
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    requirePermission,
  };
});

describe("savePageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "admin-1" });
    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx));
    prisma.cmsPage.findUnique.mockResolvedValue({
      id: "page-1",
      slug: "about",
      hero: { id: "hero-1" },
      blocks: [{ id: "block-1" }],
    });
  });

  it("persists validated hero and block video placements in one transaction", async () => {
    prisma.mediaAsset.findMany.mockResolvedValue([
      { id: "hero-image", isPublic: true, status: "REAL_APPROVED", resourceType: "IMAGE", deletionState: "ACTIVE" },
      { id: "hero-video", isPublic: true, status: "REAL_APPROVED", resourceType: "VIDEO", deletionState: "ACTIVE" },
      { id: "hero-poster", isPublic: true, status: "REAL_APPROVED", resourceType: "IMAGE", deletionState: "ACTIVE" },
      { id: "hero-mobile", isPublic: true, status: "REAL_APPROVED", resourceType: "IMAGE", deletionState: "ACTIVE" },
      { id: "block-video", isPublic: true, status: "REAL_APPROVED", resourceType: "VIDEO", deletionState: "ACTIVE" },
      { id: "block-poster", isPublic: true, status: "REAL_APPROVED", resourceType: "IMAGE", deletionState: "ACTIVE" },
      { id: "block-mobile", isPublic: true, status: "REAL_APPROVED", resourceType: "IMAGE", deletionState: "ACTIVE" },
    ]);

    const { savePageAction } = await import("./content");

    const result = await savePageAction(
      "page-1",
      "about",
      {
        id: "hero-1",
        richHeading: { type: "doc", content: [] },
        imageId: "hero-image",
        videoId: "hero-video",
        posterImageId: "hero-poster",
        mobileImageId: "hero-mobile",
        overlayEnabled: true,
      },
      [
        {
          id: "block-1",
          blockType: "image_text",
          content: { title: "Video section" },
          visible: true,
          videoId: "block-video",
          posterImageId: "block-poster",
          mobileImageId: "block-mobile",
        },
      ]
    );

    expect(result).toEqual({ success: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.cmsHeroSection.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "hero-1" },
        data: expect.objectContaining({
          imageId: "hero-image",
          videoId: "hero-video",
          posterImageId: "hero-poster",
          mobileImageId: "hero-mobile",
        }),
      })
    );
    expect(tx.cmsContentBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "block-1" },
        data: expect.objectContaining({
          videoId: "block-video",
          posterImageId: "block-poster",
          mobileImageId: "block-mobile",
        }),
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/en/about");
    expect(revalidatePath).toHaveBeenCalledWith("/ne/about");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/content");
  });

  it("rejects wrong resource types before any write occurs", async () => {
    prisma.mediaAsset.findMany.mockResolvedValue([
      { id: "block-video", isPublic: true, status: "REAL_APPROVED", resourceType: "IMAGE", deletionState: "ACTIVE" },
    ]);

    const { savePageAction } = await import("./content");

    const result = await savePageAction(
      "page-1",
      "about",
      {
        id: "hero-1",
        richHeading: { type: "doc", content: [] },
        overlayEnabled: false,
      },
      [
        {
          id: "block-1",
          blockType: "image_text",
          content: {},
          videoId: "block-video",
        },
      ]
    );

    expect(result).toEqual({
      success: false,
      error: "Block video has the wrong media type.",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(tx.cmsHeroSection.update).not.toHaveBeenCalled();
    expect(tx.cmsContentBlock.update).not.toHaveBeenCalled();
  });

  it("keeps existing image-only pages backward compatible", async () => {
    prisma.mediaAsset.findMany.mockResolvedValue([
      { id: "hero-image", isPublic: true, status: "AI_PLACEHOLDER", resourceType: "IMAGE", deletionState: "ACTIVE" },
      { id: "block-image", isPublic: true, status: "REAL_APPROVED", resourceType: "IMAGE", deletionState: "ACTIVE" },
    ]);

    const { savePageAction } = await import("./content");

    const result = await savePageAction(
      "page-1",
      "about",
      {
        id: "hero-1",
        richHeading: { type: "doc", content: [] },
        imageId: "hero-image",
        overlayEnabled: false,
      },
      [
        {
          id: "block-1",
          blockType: "introduction",
          content: { title: "Image only" },
          imageId: "block-image",
        },
      ]
    );

    expect(result).toEqual({ success: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
