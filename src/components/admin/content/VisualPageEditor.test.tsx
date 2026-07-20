import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  reorderBlocks,
  VISUAL_PAGE_EDITOR_DND_ID,
  VisualPageEditor,
} from "./VisualPageEditor";

vi.mock("@/components/cms/DynamicHero", () => ({
  DynamicHero: () => <section data-testid="hero-preview" />,
}));

vi.mock("./AdminPreviewBlockRenderer", () => ({
  AdminPreviewBlockRenderer: ({ block }: { block: { id: string } }) => (
    <section data-testid={`preview-${block.id}`} />
  ),
}));

const page = {
  id: "page-1",
  slug: "home",
  hero: null,
  blocks: [
    {
      id: "block-1",
      blockType: "introduction",
      visible: true,
      order: 0,
      content: { title: "Intro" },
    },
    {
      id: "block-2",
      blockType: "image_text",
      visible: true,
      order: 1,
      content: { title: "Details" },
    },
  ],
};

describe("VisualPageEditor sortable blocks", () => {
  it("renders deterministic dnd-kit described-by ids for SSR and initial client markup", () => {
    const firstRender = renderToStaticMarkup(<VisualPageEditor initialPage={page} previewData={{}} />);
    const initialClientRender = renderToStaticMarkup(<VisualPageEditor initialPage={page} previewData={{}} />);

    expect(firstRender).toContain(`aria-describedby="${VISUAL_PAGE_EDITOR_DND_ID}"`);
    expect(initialClientRender).toContain(`aria-describedby="${VISUAL_PAGE_EDITOR_DND_ID}"`);
    expect(firstRender).not.toMatch(/DndDescribedBy-\d+/);
    expect(initialClientRender).not.toMatch(/DndDescribedBy-\d+/);
  });

  it("keeps sortable drag handles active and keyboard reachable after hydration", () => {
    const html = renderToStaticMarkup(<VisualPageEditor initialPage={page} previewData={{}} />);

    expect(html.match(/data-drag-handle="section"/g)).toHaveLength(2);
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-roledescription="sortable"');
    expect(html).toContain(`aria-describedby="${VISUAL_PAGE_EDITOR_DND_ID}"`);
  });

  it("preserves existing block ordering behavior", () => {
    expect(reorderBlocks(page.blocks, "block-2", "block-1")).toEqual([
      expect.objectContaining({ id: "block-2", order: 0 }),
      expect.objectContaining({ id: "block-1", order: 1 }),
    ]);

    expect(reorderBlocks(page.blocks, "missing", "block-1")).toBe(page.blocks);
  });
});
