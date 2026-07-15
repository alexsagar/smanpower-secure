import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DynamicHero } from "./DynamicHero";

describe("DynamicHero media rendering", () => {
  it("renders managed hero video with muted inline playback and poster fallback", () => {
    const html = renderToStaticMarkup(
      <DynamicHero
        hero={{
          id: "hero-1",
          pageSlug: "home",
          heroType: "video",
          richHeading: { type: "doc", content: [] },
          overlayEnabled: true,
          textAlignment: "center",
          verticalAlignment: "center",
          video: {
            id: "video-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/hero.mp4",
            resourceType: "video",
            fileName: "hero.mp4",
            altText: "Hero video",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          videoPoster: {
            id: "poster-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/poster.jpg",
            resourceType: "image",
            fileName: "poster.jpg",
            altText: "Poster image",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          mobileImage: {
            id: "mobile-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/mobile.jpg",
            resourceType: "image",
            fileName: "mobile.jpg",
            altText: "Mobile fallback",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }}
      />
    );

    expect(html).toContain("<video");
    expect(html).toContain("muted");
    expect(html).toContain("playsInline");
    expect(html).toContain('poster="https://cdn.example.com/poster.jpg"');
    expect(html).toContain("motion-reduce:hidden");
    expect(html).toContain("Pause background video");
  });
});
