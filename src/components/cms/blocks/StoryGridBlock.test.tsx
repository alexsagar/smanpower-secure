import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import type { CmsContentBlock } from "@/types/content";

vi.mock("server-only", () => ({}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => jsx("img", props),
}));

vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => jsx("div", { children }),
}));

const { StoryGridBlock } = await import("./StoryGridBlock");

const block = {
  id: "block-home-stories",
  blockType: "story_grid",
  visible: true,
  content: {
    heading: "Real Outcomes.",
    stories: [{ type: "candidate", title: "Authored Fallback Story", desc: "demo" }],
  },
} as unknown as CmsContentBlock;

describe("StoryGridBlock", () => {
  it("renders backend stories and links them to their detail page", () => {
    const html = renderToStaticMarkup(
      <StoryGridBlock
        block={block}
        lang="en"
        stories={[{ type: "employer", title: "Real Backend Story", slug: "real-backend-story" }]}
      />
    );
    expect(html).toContain("Real Backend Story");
    expect(html).toContain("/success-stories/real-backend-story");
    expect(html).not.toContain("Authored Fallback Story");
  });

  it("falls back to the block's authored stories when nothing is published", () => {
    const html = renderToStaticMarkup(<StoryGridBlock block={block} lang="en" stories={[]} />);
    expect(html).toContain("Authored Fallback Story");
  });
});
