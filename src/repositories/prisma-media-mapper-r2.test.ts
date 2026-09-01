import { describe, expect, it } from "vitest";
import { mapPrismaMediaAsset } from "./prisma-content-repository";
import { resolveMediaUrl } from "@/lib/media-resolver";

// Guards the delivery bug where the mapper dropped provider/storageKey, so an
// R2 MediaAsset still resolved to its legacy Cloudinary fileUrl. The mapper must
// forward enough for resolveMediaUrl() to pick the right provider.
const CLOUD_URL =
  "https://res.cloudinary.com/o99xd4mq/image/upload/v1788246960/seven-seas-cms/uffiosbz7ffsakp7digy.png";

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: "asset-1",
    publicId: "seven-seas-cms/uffiosbz7ffsakp7digy",
    fileUrl: CLOUD_URL,
    fileName: "uffiosbz7ffsakp7digy.png",
    status: "REAL_APPROVED",
    isPublic: true,
    resourceType: "IMAGE" as const,
    createdAt: new Date("2026-09-01T07:16:02.676Z"),
    ...overrides,
  };
}

describe("mapPrismaMediaAsset forwards provider/storageKey", () => {
  it("R2 row resolves to media.smanpower.com, not Cloudinary", () => {
    const mapped = mapPrismaMediaAsset(
      row({ provider: "R2", storageKey: "legacy/cloudinary/image/seven-seas-cms/uffiosbz7ffsakp7digy.png" })
    );
    expect(mapped.provider).toBe("R2");
    expect(mapped.storageKey).toBe("legacy/cloudinary/image/seven-seas-cms/uffiosbz7ffsakp7digy.png");
    // Cloudinary URL kept for audit/rollback.
    expect(mapped.secureUrl).toBe(CLOUD_URL);

    const url = resolveMediaUrl(mapped);
    expect(url).toContain("media.smanpower.com");
    expect(url).toContain("legacy/cloudinary/image/seven-seas-cms/uffiosbz7ffsakp7digy.png");
    expect(url).not.toContain("res.cloudinary.com");
  });

  it("CLOUDINARY row keeps Cloudinary delivery", () => {
    const mapped = mapPrismaMediaAsset(row({ provider: "CLOUDINARY", storageKey: null }));
    expect(mapped.provider).toBe("CLOUDINARY");
    expect(resolveMediaUrl(mapped)).toBe(CLOUD_URL);
  });

  it("LOCAL row keeps its local path", () => {
    const mapped = mapPrismaMediaAsset(
      row({ provider: "LOCAL", storageKey: null, fileUrl: "/images/local-hero.png" })
    );
    expect(mapped.source).toBe("LOCAL_DEMO");
    expect(resolveMediaUrl(mapped)).toBe("/images/local-hero.png");
  });
});
