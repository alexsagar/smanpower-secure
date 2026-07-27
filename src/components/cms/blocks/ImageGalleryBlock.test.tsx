import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { ImageGalleryBlock } from "./ImageGalleryBlock";

vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => jsx("img", props) }));

describe("ImageGalleryBlock", () => {
  it("renders only editor-supplied images and captions", () => {
    const html = renderToStaticMarkup(<ImageGalleryBlock block={{ content: { items: [{ imageUrl: "https://res.cloudinary.com/demo/image/upload/visit.png", caption: "Visitor meeting" }, { imageUrl: "" }] } } as never} />);
    expect(html).toContain("Visitor meeting");
    expect(html).toContain("f_auto,q_auto,c_limit,w_1200,h_900");
  });

  it("renders nothing until editors add an image", () => {
    expect(renderToStaticMarkup(<ImageGalleryBlock block={{ content: { items: [] } } as never} />)).toBe("");
  });
});
