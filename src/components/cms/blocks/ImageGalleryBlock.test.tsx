import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { ImageGalleryBlock } from "./ImageGalleryBlock";

vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => jsx("img", props) }));

const IMAGE = "https://res.cloudinary.com/demo/image/upload/visit.png";

describe("ImageGalleryBlock", () => {
  it("renders an album's title, description and images", () => {
    const html = renderToStaticMarkup(
      <ImageGalleryBlock
        block={{
          content: {
            albums: [
              {
                title: "Training",
                description: "Ten sessions from our Kathmandu centre.",
                images: [{ imageUrl: IMAGE, title: "Welding bay" }, { imageUrl: "" }],
              },
            ],
          },
        } as never}
      />
    );
    expect(html).toContain("Training");
    expect(html).toContain("Ten sessions from our Kathmandu centre.");
    expect(html).toContain("Welding bay");
    // Gallery thumbnails: a small, intentionally-cropped delivery variant
    // with a responsive ladder — never the full-size master.
    expect(html).toContain("c_fill,w_480,h_360,g_auto,q_auto:good,f_auto");
    expect(html).toContain("240w");
    expect(html).toContain('loading="lazy"');
  });

  it("still renders galleries saved before albums existed", () => {
    const html = renderToStaticMarkup(
      <ImageGalleryBlock block={{ content: { items: [{ imageUrl: IMAGE, title: "Visitor meeting" }] } } as never} />
    );
    expect(html).toContain("Visitor meeting");
  });

  it("skips an album an editor has titled but not filled with images", () => {
    const html = renderToStaticMarkup(
      <ImageGalleryBlock
        block={{
          content: {
            albums: [
              { title: "Empty", description: "Nothing here yet.", images: [{ imageUrl: "" }] },
              { title: "Training", description: "", images: [{ imageUrl: IMAGE, title: "" }] },
            ],
          },
        } as never}
      />
    );
    expect(html).not.toContain("Nothing here yet.");
    expect(html).toContain("Training");
  });

  it("renders nothing until editors add an image", () => {
    expect(renderToStaticMarkup(<ImageGalleryBlock block={{ content: { albums: [] } } as never} />)).toBe("");
  });
});
