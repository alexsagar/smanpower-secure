import { describe, expect, it } from "vitest";
import {
  mapNavigationGroups,
  mapPrismaMediaAsset,
  mapUrlBackedMediaAsset,
} from "./prisma-content-repository";
import {
  authoritativeMediaResourceTypeFromCloudinary,
  authoritativeMediaResourceTypeFromMimeType,
  cmsMediaResourceTypeFromAuthoritative,
} from "@/lib/media-resource-type";

describe("Prisma content repository helpers", () => {
  it("preserves authoritative prisma media metadata", () => {
    const media = mapPrismaMediaAsset({
      id: "media-1",
      publicId: "cloud/public-id",
      assetId: "asset-1",
      fileUrl: "https://cdn.example.com/file.pdf",
      fileName: "file.pdf",
      altText: "Secure file",
      caption: "caption",
      folder: "seven-seas-candidates",
      tags: ["candidate"],
      status: "INTERNAL_DOCUMENT",
      isPublic: false,
      mimeType: "application/pdf",
      resourceType: "DOCUMENT",
      fileSize: 2048,
      width: null,
      height: null,
      duration: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    expect(media.source).toBe("CLOUDINARY");
    expect(media.mediaStatus).toBe("INTERNAL_DOCUMENT");
    expect(media.visibility).toBe("PRIVATE");
    expect(media.resourceType).toBe("document");
    expect(media.cloudinaryPublicId).toBe("cloud/public-id");
  });

  it("maps authoritative media resource types from MIME types", () => {
    expect(authoritativeMediaResourceTypeFromMimeType("image/jpeg")).toBe("IMAGE");
    expect(authoritativeMediaResourceTypeFromMimeType("video/mp4")).toBe("VIDEO");
    expect(authoritativeMediaResourceTypeFromMimeType("application/pdf")).toBe("DOCUMENT");
  });

  it("maps authoritative media resource types from verified Cloudinary resource types", () => {
    expect(authoritativeMediaResourceTypeFromCloudinary("image", "image/jpeg")).toBe("IMAGE");
    expect(authoritativeMediaResourceTypeFromCloudinary("video", "video/mp4")).toBe("VIDEO");
    expect(authoritativeMediaResourceTypeFromCloudinary("raw", "application/pdf")).toBe("DOCUMENT");
    expect(cmsMediaResourceTypeFromAuthoritative("VIDEO")).toBe("video");
  });

  it("does not label URL-backed database media as LOCAL_DEMO", () => {
    const media = mapUrlBackedMediaAsset(
      "https://cdn.example.com/image.jpg",
      { altText: "Hero image" }
    );

    expect(media.source).toBe("CLOUDINARY");
    expect(media.fileName).toBe("image.jpg");
    expect(media.mediaStatus).toBe("REAL_APPROVED");
  });

  it("excludes inactive navigation groups and children without forcing active state", () => {
    const navs = mapNavigationGroups([
      {
        id: "parent-active",
        label: "Active parent",
        location: "header",
        order: 1,
        isActive: true,
        children: [
          {
            id: "child-active",
            label: "Active child",
            href: "/active",
            order: 1,
            isActive: true,
          },
          {
            id: "child-inactive",
            label: "Inactive child",
            href: "/inactive",
            order: 2,
            isActive: false,
          },
        ],
      },
      {
        id: "parent-inactive",
        label: "Inactive parent",
        location: "header",
        order: 2,
        isActive: false,
        children: [],
      },
    ]);

    expect(navs).toHaveLength(1);
    expect(navs[0].items).toHaveLength(1);
    expect(navs[0].items[0].id).toBe("child-active");
    expect(navs[0].items[0].isActive).toBe(true);
  });
});
