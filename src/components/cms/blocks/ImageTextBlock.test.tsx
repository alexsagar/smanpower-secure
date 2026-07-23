import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageTextBlock } from "./ImageTextBlock";

describe("ImageTextBlock media rendering", () => {
  it("renders managed block video with controls and no autoplay", () => {
    const html = renderToStaticMarkup(
      <ImageTextBlock
        lang="en"
        block={{
          id: "block-1",
          blockKey: "block-1",
          blockType: "image_text",
          pageSlug: "about",
          order: 0,
          visible: true,
          content: { paragraphs: ["Text"] },
          richHeading: { type: "doc", content: [] },
          video: {
            id: "video-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/section.mp4",
            resourceType: "video",
            fileName: "section.mp4",
            altText: "Section video",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          videoPoster: {
            id: "poster-1",
            source: "CLOUDINARY",
            secureUrl: "https://cdn.example.com/section-poster.jpg",
            resourceType: "image",
            fileName: "section-poster.jpg",
            altText: "Section poster",
            mediaStatus: "REAL_APPROVED",
            visibility: "PUBLIC",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }}
      />
    );

    expect(html).toContain("<video");
    expect(html).toContain("controls");
    expect(html).toContain('preload="none"');
    expect(html).not.toContain("autoplay");
  });
});
