import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TEXT_STYLE_PRESETS, type TiptapContent } from "@/types/content";
import { getStyleForPreset } from "@/components/admin/editor/style-presets";
import { RichTextRenderer } from "./RichTextRenderer";

function styledContent(preset: string): TiptapContent {
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Styled text", marks: [{ type: "brandStyle", attrs: { preset } }] }] }] };
}

describe("RichTextRenderer", () => {
  it.each(TEXT_STYLE_PRESETS)("renders %s using its public style mapping", (preset) => {
    const html = renderToStaticMarkup(<RichTextRenderer content={styledContent(preset)} />);
    expect(html).toContain(`data-text-style="${preset}"`);
    expect(html).toContain(getStyleForPreset(preset));
  });

  it("falls back safely for legacy unknown presets", () => {
    const html = renderToStaticMarkup(<RichTextRenderer content={styledContent("legacy-style")} />);
    expect(html).toContain("font-sans");
    expect(html).toContain('data-text-style="legacy-style"');
  });

  it("keeps headings, links, lists, and blockquotes structurally valid", () => {
    const content: TiptapContent = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Heading", marks: [{ type: "brandStyle", attrs: { preset: "small-eyebrow" } }] }] },
        { type: "paragraph", content: [{ type: "text", text: "Link", marks: [{ type: "link", attrs: { href: "/contact" } }, { type: "brandStyle", attrs: { preset: "cta-link-style" } }] }] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item" }] }] }] },
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Quote" }] }] },
      ],
    };
    const html = renderToStaticMarkup(<RichTextRenderer content={content} />);

    expect(html).toContain("<h2");
    expect(html).toContain('href="/contact"');
    expect(html).toContain("<ul");
    expect(html).toContain("<blockquote");
  });
});
