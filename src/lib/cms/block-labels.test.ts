import { describe, expect, it } from "vitest";
import { blockSummary, blockTypeCategory, blockTypeLabel } from "./block-labels";

describe("block labels", () => {
  it("gives raw block types a readable name", () => {
    expect(blockTypeLabel("map_intelligence")).toBe("Talent Dashboard");
    expect(blockTypeLabel("client_marquee")).toBe("Client Marquee");
    expect(blockTypeLabel("page_copy")).toBe("Page Copy");
  });

  // A new block type must still read sensibly rather than showing a raw slug.
  it("humanizes unknown block types", () => {
    expect(blockTypeLabel("brand_new_block")).toBe("Brand New Block");
    expect(blockTypeCategory("brand_new_block")).toBe("Narrative");
  });

  it("categorises blocks for the editor badge", () => {
    expect(blockTypeCategory("statistics")).toBe("Data");
    expect(blockTypeCategory("story_grid")).toBe("Collection");
    expect(blockTypeCategory("final_cta")).toBe("Conversion");
  });
});

describe("block summary", () => {
  it("prefers a headline field", () => {
    expect(blockSummary({ blockType: "editorial", content: { eyebrow: "Real Results", title: "Our Story" } }))
      .toBe("Our Story");
  });

  it("falls back to a heading lead when there is no title", () => {
    expect(blockSummary({ blockType: "story_grid", content: { headingLead: "Write your own " } }))
      .toBe("Write your own");
  });

  it("counts list items when there is no usable string", () => {
    expect(blockSummary({ blockType: "statistics", content: { stats: [1, 2, 3] } })).toBe("3 stats");
  });

  it("falls back to the block label for empty content", () => {
    expect(blockSummary({ blockType: "map_intelligence", content: {} })).toBe("Talent Dashboard");
    expect(blockSummary({ blockType: "statistics" })).toBe("Statistics");
  });
});
