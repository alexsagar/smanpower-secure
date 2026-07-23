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
            cloudinaryPublicId: "cms/hero",
            secureUrl: "https://cdn.example.com/demo-cloud/video/upload/v123/cms/hero.mp4",
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
    expect(html).not.toContain('src="https://cdn.example.com/demo-cloud/video/upload/v123/cms/hero.mp4"');
    expect(html).not.toContain("f_mp4,q_auto:good");
    expect(html).not.toContain("f_webm,q_auto:good");
    expect(html).not.toContain('src="https://cdn.example.com/poster.jpg" autoPlay');
    expect(html).toContain("muted");
    expect(html).toContain("playsInline");
    expect(html).toContain('poster="https://cdn.example.com/poster.jpg"');
    expect(html).toContain("motion-reduce:hidden");
    expect(html).not.toContain("Pause background video");
  });

  it("uses the selected video as the video source and the existing image only as fallback", () => {
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
          image: {
            id: "image-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/old-image.jpg",
            resourceType: "image",
            fileName: "old-image.jpg",
            altText: "Old image",
            mediaStatus: "AI_PLACEHOLDER",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          video: {
            id: "video-1",
            source: "CLOUDINARY",
            cloudinaryPublicId: "cms/selected-video",
            secureUrl: "https://cdn.example.com/demo-cloud/video/upload/v123/cms/selected-video.mp4",
            resourceType: "video",
            fileName: "selected-video.mp4",
            altText: "Selected video",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }}
      />
    );

    expect(html).not.toContain('src="https://cdn.example.com/demo-cloud/video/upload/v123/cms/selected-video.mp4"');
    expect(html).toContain('poster="https://cdn.example.com/old-image.jpg"');
    expect(html).not.toContain('src="https://cdn.example.com/old-image.jpg" autoPlay');
    expect(html).not.toContain("hidden md:block");
  });

  it("uses an explicit mobile fallback without treating the old desktop image as mobile-only", () => {
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
          image: {
            id: "image-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/old-image.jpg",
            resourceType: "image",
            fileName: "old-image.jpg",
            altText: "Old image",
            mediaStatus: "AI_PLACEHOLDER",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          video: {
            id: "video-1",
            source: "CLOUDINARY",
            cloudinaryPublicId: "cms/selected-video",
            secureUrl: "https://cdn.example.com/demo-cloud/video/upload/v123/cms/selected-video.mp4",
            resourceType: "video",
            fileName: "selected-video.mp4",
            altText: "Selected video",
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

    expect(html).not.toContain('src="https://cdn.example.com/demo-cloud/video/upload/v123/cms/selected-video.mp4"');
    expect(html).toContain('srcSet="/_next/image?url=https%3A%2F%2Fcdn.example.com%2Fmobile.jpg');
    expect(html).toContain("hidden md:block");
  });

  it("derives a Cloudinary first-frame poster when no explicit poster or image is set", () => {
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
            cloudinaryPublicId: "staging/hero",
            secureUrl: "https://res.cloudinary.com/demo/video/upload/v123/staging/hero.mp4",
            resourceType: "video",
            fileName: "hero.mp4",
            altText: "Hero video",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }}
      />
    );

    expect(html).toContain('poster="https://res.cloudinary.com/demo/video/upload/so_0/v123/staging/hero.jpg"');
  });

  it("does not use a poster fallback as the video source when the video URL is missing", () => {
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
            resourceType: "video",
            fileName: "selected-video.mp4",
            altText: "Selected video",
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
            altText: "Poster",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }}
      />
    );

    expect(html).not.toContain("<video");
    expect(html).not.toContain("Pause background video");
  });

  it("does not enter video mode without a playable video source", () => {
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
          image: {
            id: "image-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/fallback.jpg",
            resourceType: "image",
            fileName: "fallback.jpg",
            altText: "Fallback image",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }}
      />
    );

    expect(html).not.toContain("<video");
    expect(html).toContain("fallback.jpg");
    expect(html).not.toContain("Pause background video");
  });
});
