import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DynamicHero } from "./DynamicHero";
import type { CmsHeroSection, CmsMediaAsset } from "@/types/content";

/**
 * Server-rendered hero contract. Video mounting rules (mobile, reduced motion,
 * Data Saver, failure fallback) are covered in HeroVideo.test.tsx, which needs a
 * DOM; everything here is about what ships in the initial HTML.
 */

function media(overrides: Partial<CmsMediaAsset> & { secureUrl: string }): CmsMediaAsset {
  return {
    id: "m",
    source: "CLOUDINARY",
    resourceType: "image",
    fileName: "f",
    altText: "",
    mediaStatus: "REAL_APPROVED",
    visibility: "PUBLIC",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function hero(overrides: Partial<CmsHeroSection> = {}): CmsHeroSection {
  return {
    id: "hero-1",
    pageSlug: "home",
    heroType: "video",
    richHeading: { type: "doc", content: [] },
    overlayEnabled: true,
    textAlignment: "center",
    verticalAlignment: "center",
    ...overrides,
  };
}

const video = media({
  secureUrl: "https://res.cloudinary.com/demo/video/upload/v123/seven-seas-cms/hero.mp4",
  resourceType: "video",
  fileName: "hero.mp4",
  cloudinaryPublicId: "seven-seas-cms/hero",
});

describe("DynamicHero server markup", () => {
  it("never ships the video element or its URL in the initial HTML", () => {
    const html = renderToStaticMarkup(<DynamicHero hero={hero({ video })} />);

    expect(html).not.toContain("<video");
    expect(html).not.toContain(".mp4");
    // No CSS-hidden video either — the old approach still downloaded it.
    expect(html).not.toContain("hidden md:block");
    expect(html).not.toContain("motion-reduce:hidden");
  });

  it("paints a poster generated from the selected video when none is configured", () => {
    const html = renderToStaticMarkup(<DynamicHero hero={hero({ video })} />);

    expect(html).toContain("/video/upload/");
    expect(html).toContain("so_auto");
    expect(html).toContain("q_auto:good");
    expect(html).toContain("seven-seas-cms/hero.jpg");
  });

  it("prefers an explicit CMS poster over the generated frame", () => {
    const html = renderToStaticMarkup(
      <DynamicHero
        hero={hero({
          video,
          videoPoster: media({
            secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/chosen-poster.jpg",
          }),
        })}
      />
    );

    expect(html).toContain("chosen-poster.jpg");
    expect(html).not.toContain("so_auto");
  });

  it("falls back to the approved hero image when there is no poster", () => {
    const html = renderToStaticMarkup(
      <DynamicHero
        hero={hero({
          video: media({ ...video, secureUrl: "https://cdn.example.com/not-cloudinary.mp4" }),
          image: media({ secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/old-image.jpg" }),
        })}
      />
    );

    expect(html).toContain("old-image.jpg");
    expect(html).not.toContain("<video");
  });

  it("uses an explicit mobile fallback as a picture source, not a hidden image", () => {
    const html = renderToStaticMarkup(
      <DynamicHero
        hero={hero({
          video,
          mobileImage: media({
            secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/mobile.jpg",
          }),
        })}
      />
    );

    expect(html).toContain("<picture>");
    expect(html).toContain('media="(max-width: 767px)"');
    expect(html).toContain("mobile.jpg");
  });
});

describe("DynamicHero without a playable video", () => {
  it("renders the hero image through the hero preset", () => {
    const html = renderToStaticMarkup(
      <DynamicHero
        hero={hero({
          heroType: "image",
          image: media({
            secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/fallback.jpg",
            width: 3000,
            height: 2000,
          }),
        })}
      />
    );

    expect(html).not.toContain("<video");
    expect(html).toContain("fallback.jpg");
    expect(html).toContain("c_fill");
    expect(html).toContain("q_auto:good");
    // Above-the-fold hero is the LCP candidate.
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
  });

  it("does not enter video mode when the video record has no URL", () => {
    const html = renderToStaticMarkup(
      <DynamicHero
        hero={hero({
          video: media({ secureUrl: undefined as unknown as string, resourceType: "video" }),
          videoPoster: media({
            secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/poster.jpg",
          }),
        })}
      />
    );

    expect(html).not.toContain("<video");
    expect(html).not.toContain("Pause video");
  });
});

describe("DynamicHero certification badges", () => {
  it("delivers trust badges at badge size with their accessible names", () => {
    const html = renderToStaticMarkup(
      <DynamicHero
        hero={hero({ heroType: "image" })}
        certificationLogos={[
          {
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/iso.png",
            accessibleName: "ISO 9001:2015 certification",
            enabled: true,
            order: 1,
          },
        ]}
      />
    );

    expect(html).toContain('alt="ISO 9001:2015 certification"');
    expect(html).toContain("c_limit");
    expect(html).toContain("q_auto:best");
    // A 96px badge must never pull the master.
    expect(html).not.toContain("w_1600");
    expect(html).toContain("object-contain");
  });
});
