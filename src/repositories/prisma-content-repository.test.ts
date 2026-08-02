import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  mapNavigationGroups,
  mapPrismaMediaAsset,
  mapUrlBackedMediaAsset,
  PrismaContentRepository,
} from "./prisma-content-repository";
import {
  authoritativeMediaResourceTypeFromCloudinary,
  authoritativeMediaResourceTypeFromMimeType,
  cmsMediaResourceTypeFromAuthoritative,
} from "@/lib/media-resource-type";

const prismaMock = vi.hoisted(() => ({
  cmsPage: {
    findUnique: vi.fn(),
  },
  siteSetting: {
    findMany: vi.fn(),
  },
  navigationItem: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

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
    const media = mapUrlBackedMediaAsset("https://cdn.example.com/image.jpg", { altText: "Hero image" });

    expect(media.source).toBe("CLOUDINARY");
    expect(media.fileName).toBe("image.jpg");
    expect(media.mediaStatus).toBe("REAL_APPROVED");
  });

  it("reads homepage video hero media as the public video source and keeps image as fallback", async () => {
    prismaMock.cmsPage.findUnique.mockResolvedValue({
      id: "page_home",
      slug: "home",
      title: "Home",
      status: "PUBLISHED",
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      hero: {
        id: "hero-1",
        videoId: "video-1",
        imageId: "image-1",
        posterImageId: null,
        mobileImageId: null,
        eyebrow: null,
        richHeading: { type: "doc", content: [] },
        richDescription: null,
        primaryCtaText: null,
        primaryCtaHref: null,
        secondaryCtaText: null,
        secondaryCtaHref: null,
        overlayEnabled: true,
        image: {
          id: "image-1",
          fileUrl: "https://cdn.example.com/fallback.jpg",
          fileName: "fallback.jpg",
          altText: "Fallback",
          status: "AI_PLACEHOLDER",
          isPublic: true,
          resourceType: "IMAGE",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        video: {
          id: "video-1",
          publicId: "cms/hero-video",
          fileUrl: "https://cdn.example.com/selected-video.mp4",
          fileName: "selected-video.mp4",
          altText: "Selected video",
          status: "REAL_APPROVED",
          isPublic: true,
          resourceType: "VIDEO",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        posterImage: null,
        mobileImage: null,
      },
      blocks: [],
    });

    const repository = new PrismaContentRepository();
    const hero = await repository.getHeroByPageSlug("home");

    expect(hero?.heroType).toBe("video");
    expect(hero?.video?.id).toBe("video-1");
    expect(hero?.video?.resourceType).toBe("video");
    expect(hero?.video?.secureUrl).toBe("https://cdn.example.com/selected-video.mp4");
    expect(hero?.image?.secureUrl).toBe("https://cdn.example.com/fallback.jpg");
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

describe("PrismaContentRepository footer mapping", () => {
  beforeEach(() => {
    prismaMock.siteSetting.findMany.mockReset();
    prismaMock.navigationItem.findMany.mockReset();
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("maps footer mission, CTA, legal links, contact fields, and footer navigation from Prisma settings", async () => {
    prismaMock.siteSetting.findMany.mockImplementation(async (args?: { where?: { key?: { in?: string[] } } }) => {
      const keys = args?.where?.key?.in ?? [];

      if (keys.includes("footer_contact")) {
        return [
          {
            key: "footer_contact",
            value: {
              address: "Ward No. 8, Guheswori",
              addressLine2: "Kathmandu Metropolitan City",
              city: "Kathmandu",
              province: "Bagmati",
              country: "Nepal",
              postalCode: "00977",
              phone: "+977-1-5107440",
              phoneDisplay: "01-5107440",
              fax: "+977-1-4479655",
              email: "info@smanpower.com",
              whatsapp: "+977 98000 00000",
              officeHours: "Sun-Fri: 10:00 AM - 5:00 PM",
            },
          },
        ];
      }

      return [
        { key: "footer_mission", value: "Responsible recruitment for global employers." },
        { key: "footer_cta", value: { text: "Request Workforce", href: "/employers/request-workforce" } },
        {
          key: "footer_legal_links",
          value: [{ label: "Policies", href: "/trust-centre/policies" }],
        },
        {
          key: "footer_social_links",
          value: [
            { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/company/seven-seas", isActive: true, order: 2 },
            { platform: "facebook", label: "Facebook", url: "https://facebook.com/sevenseas", isActive: true, order: 1 },
            { platform: "youtube", label: "YouTube", url: "http://localhost:3000/invalid", isActive: true, order: 3 },
          ],
        },
        {
          key: "footer_copyright",
          value: "Copyright 2026 Seven Seas Intercontinental Services Pvt. Ltd. All rights reserved.",
        },
      ];
    });

    prismaMock.navigationItem.findMany.mockResolvedValue([
      {
        label: "Company",
        children: [
          { label: "Leadership", href: "/about/leadership" },
          { label: "Inactive Placeholder", href: null },
        ],
      },
      {
        label: "Trust",
        children: [{ label: "Licences", href: "/trust-centre/licences" }],
      },
    ]);

    const { PrismaContentRepository } = await import("./prisma-content-repository");
    const repository = new PrismaContentRepository();
    const [siteSettings, footerSettings] = await Promise.all([
      repository.getSiteSettings(),
      repository.getFooterSettings(),
    ]);

    expect(siteSettings.footerAddressLines).toEqual([
      "Ward No. 8, Guheswori",
      "Kathmandu Metropolitan City",
      "Kathmandu, Bagmati, Nepal 00977",
    ]);
    expect(siteSettings.emailDisplay).toBe("info@smanpower.com");
    expect(siteSettings.emailHref).toBe("mailto:info@smanpower.com");
    expect(siteSettings.phoneDisplay).toBe("01-5107440");
    expect(siteSettings.phoneHref).toBe("tel:015107440");
    expect(siteSettings.faxDisplay).toBe("+977-1-4479655");
    expect(siteSettings.faxHref).toBe("tel:+97714479655");
    expect(siteSettings.whatsappDisplay).toBe("+977 98000 00000");
    expect(siteSettings.whatsappHref).toBe("https://wa.me/9779800000000");
    expect(siteSettings.officeHours).toBe("Sun-Fri: 10:00 AM - 5:00 PM");
    expect(siteSettings).not.toHaveProperty("socialLinks");

    expect(footerSettings.tagline).toBe("Responsible recruitment for global employers.");
    expect(footerSettings.ctaText).toBe("Request Workforce");
    expect(footerSettings.ctaHref).toBe("/employers/request-workforce");
    expect(footerSettings.legalLinks).toEqual([{ label: "Policies", href: "/trust-centre/policies" }]);
    expect(footerSettings.socialLinks).toEqual([
      { platform: "facebook", label: "Facebook", url: "https://facebook.com/sevenseas", isActive: true, order: 1 },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/company/seven-seas", isActive: true, order: 2 },
    ]);
    expect(footerSettings.sections).toEqual([
      {
        title: "Company",
        links: [{ label: "Leadership", href: "/about/leadership" }],
      },
      {
        title: "Trust",
        links: [{ label: "Licences", href: "/trust-centre/licences" }],
      },
    ]);
  });

  it("keeps the current two-setting database shape compatible and does not fall back to demo footer values", async () => {
    prismaMock.siteSetting.findMany.mockImplementation(async (args?: { where?: { key?: { in?: string[] } } }) => {
      const keys = args?.where?.key?.in ?? [];

      if (keys.includes("footer_contact")) {
        return [
          {
            key: "footer_contact",
            value: {
              address: "Guheswori",
              city: "Kathmandu",
              province: "Bagmati",
              country: "Nepal",
              phone: "01-5107440",
              email: "info@smanpower.com",
            },
          },
        ];
      }

      return [{ key: "footer_mission", value: "Responsible recruitment. Prepared Workforce." }];
    });

    prismaMock.navigationItem.findMany.mockResolvedValue([]);

    const { PrismaContentRepository } = await import("./prisma-content-repository");
    const repository = new PrismaContentRepository();
    const [siteSettings, footerSettings] = await Promise.all([
      repository.getSiteSettings(),
      repository.getFooterSettings(),
    ]);

    expect(siteSettings.emailHref).toBe("mailto:info@smanpower.com");
    expect(siteSettings.phoneHref).toBe("tel:015107440");
    expect(siteSettings.faxDisplay).toBe("Fax: +977-1-4479655");
    expect(siteSettings.faxHref).toBe("tel:+977-1-4479655");
    expect(siteSettings.footerAddressLines).toEqual(["Guheswori", "Kathmandu, Bagmati, Nepal"]);
    expect(siteSettings).not.toHaveProperty("socialLinks");

    expect(footerSettings.tagline).toBe("Responsible recruitment. Prepared Workforce.");
    expect(footerSettings.ctaText).toBe("Partner With Us");
    expect(footerSettings.ctaHref).toBe("/contact");
    expect(footerSettings.sections).toEqual([]);
    expect(footerSettings.socialLinks).toEqual([]);
    expect(footerSettings.legalLinks).toEqual([
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Worker Grievance", href: "/worker-grievance" },
    ]);
    expect(footerSettings.ctaHref).not.toBe("/employers/request-workforce");
  });

  it("fails safely for malformed footer settings and contact optionals", async () => {
    prismaMock.siteSetting.findMany.mockImplementation(async (args?: { where?: { key?: { in?: string[] } } }) => {
      const keys = args?.where?.key?.in ?? [];

      if (keys.includes("footer_contact")) {
        return [
          {
            key: "footer_contact",
            value: {
              address: "Guheswori",
              phoneDisplay: "",
              phoneHref: "javascript:alert(1)",
              faxDisplay: "",
              faxHref: "#",
              email: "info@smanpower.com",
              emailHref: "mailto:info@smanpower.com",
              whatsapp: "not-a-number",
              whatsappHref: "tel:+9771234567",
              officeHours: { unexpected: true },
              socialLinks: "legacy-string",
            },
          },
        ];
      }

      return [
        { key: "footer_mission", value: "Mission" },
        { key: "footer_cta", value: { text: "Bad CTA", href: "http://localhost:3000" } },
        { key: "footer_legal_links", value: [{ label: "Broken", href: "#" }, { label: "Also bad", href: "" }] },
        {
          key: "footer_social_links",
          value: [
            { platform: "linkedin", label: "LinkedIn", url: "notaurl", isActive: true, order: 1 },
            { platform: "js", label: "JS", url: "javascript:alert(1)", isActive: true, order: 2 },
            { platform: "data", label: "Data", url: "data:text/plain,hello", isActive: true, order: 3 },
            { platform: "mailto", label: "Mail", url: "mailto:test@example.com", isActive: true, order: 4 },
            { platform: "tel", label: "Tel", url: "tel:+97715107440", isActive: true, order: 5 },
            { platform: "relative", label: "Relative", url: "/internal", isActive: true, order: 6 },
            { platform: "localhost", label: "Localhost", url: "http://localhost:3000", isActive: true, order: 7 },
          ],
        },
        { key: "footer_copyright", value: { text: "not-a-string" } },
      ];
    });

    prismaMock.navigationItem.findMany.mockResolvedValue([]);

    const { PrismaContentRepository } = await import("./prisma-content-repository");
    const repository = new PrismaContentRepository();
    const [siteSettings, footerSettings] = await Promise.all([
      repository.getSiteSettings(),
      repository.getFooterSettings(),
    ]);

    expect(siteSettings.phoneHref).toBeUndefined();
    expect(siteSettings.emailHref).toBe("mailto:info@smanpower.com");
    expect(siteSettings.whatsappHref).toBeUndefined();
    expect(siteSettings.officeHours).toBe("");
    expect(siteSettings).not.toHaveProperty("socialLinks");
    expect(footerSettings.ctaText).toBe("Partner With Us");
    expect(footerSettings.ctaHref).toBe("/contact");
    expect(footerSettings.legalLinks).toEqual([
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Worker Grievance", href: "/worker-grievance" },
    ]);
    expect(footerSettings.socialLinks).toEqual([]);
    expect(footerSettings.sections).toEqual([]);
    expect(footerSettings.copyrightText).toBe(
      "Copyright 2026 Seven Seas Intercontinental Services Pvt. Ltd. All rights reserved."
    );
  });
});
