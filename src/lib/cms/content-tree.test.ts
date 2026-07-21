import { describe, expect, it } from "vitest";
import {
  buildContentTree,
  countTreePages,
  filterContentTree,
  humanizeSlugSegment,
  nodeLabel,
  type ContentTreePage,
} from "./content-tree";

function page(slug: string, title: string | null = null): ContentTreePage {
  return {
    id: slug,
    slug,
    title,
    status: "PUBLISHED",
    updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    blockCount: 1,
    hasHero: false,
  };
}

const SAMPLE = [
  page("home", "Homepage"),
  page("about", "About"),
  page("about/leadership", "Leadership"),
  page("about/our-story", "Our Story"),
  page("employers", "Workforce Solutions"),
  page("employers/screening", "Rigorous Candidate Screening."),
  page("privacy-policy", "Privacy Policy"),
  page("layout", "Layout"),
];

describe("hierarchy", () => {
  it("nests pages under an existing parent page", () => {
    const groups = buildContentTree(SAMPLE);
    const main = groups.find((g) => g.key === "main")!;
    const about = main.nodes.find((n) => n.slug === "about")!;

    expect(about.children.map((c) => c.slug)).toEqual(["about/leadership", "about/our-story"]);
    // A nested page must not also appear at the top level.
    expect(main.nodes.some((n) => n.slug === "about/leadership")).toBe(false);
  });

  it("keeps a child at top level when its parent page does not exist", () => {
    const groups = buildContentTree([page("demands/detail", "Detail")]);

    expect(countTreePages(groups)).toBe(1);
    expect(groups[0].nodes[0].slug).toBe("demands/detail");
  });

  it("orders main pages by the configured site order, not alphabetically", () => {
    const groups = buildContentTree(SAMPLE);
    const main = groups.find((g) => g.key === "main")!;

    expect(main.nodes.map((n) => n.slug)).toEqual(["home", "about", "employers"]);
  });

  it("puts legal and global pages in their own groups", () => {
    const groups = buildContentTree(SAMPLE);

    expect(groups.find((g) => g.key === "legal")!.nodes.map((n) => n.slug)).toEqual(["privacy-policy"]);
    expect(groups.find((g) => g.key === "global")!.nodes.map((n) => n.slug)).toEqual(["layout"]);
  });

  // Editors must never lose sight of a page just because it is new.
  it("surfaces unconfigured pages instead of hiding them", () => {
    const groups = buildContentTree([...SAMPLE, page("brand-new-page", "Brand New")]);
    const other = groups.find((g) => g.key === "other");

    expect(other).toBeDefined();
    expect(other!.nodes.map((n) => n.slug)).toContain("brand-new-page");
  });

  it("counts every page including children", () => {
    expect(countTreePages(buildContentTree(SAMPLE))).toBe(SAMPLE.length);
  });
});

describe("labels", () => {
  it("humanizes slug segments", () => {
    expect(humanizeSlugSegment("candidate-sourcing")).toBe("Candidate Sourcing");
    expect(humanizeSlugSegment("aviation-and-ground-handling")).toBe("Aviation & Ground Handling");
    expect(humanizeSlugSegment("rba-aligned-practices")).toBe("RBA Aligned Practices");
  });

  it("prefers the slug over long authored titles for child pages", () => {
    expect(nodeLabel(page("employers/screening", "Rigorous Candidate Screening."))).toBe("Screening");
  });

  it("uses a short title for top-level pages", () => {
    expect(nodeLabel(page("about", "About"))).toBe("About");
  });

  it("applies explicit overrides", () => {
    expect(nodeLabel(page("layout", "Layout"))).toBe("Global Layout");
    expect(nodeLabel(page("demands/detail", "Detail"))).toBe("Demand Detail");
  });
});

describe("search", () => {
  const groups = buildContentTree(SAMPLE);

  it("returns everything for an empty query", () => {
    expect(countTreePages(filterContentTree(groups, "   "))).toBe(SAMPLE.length);
  });

  it("matches on label, slug and title", () => {
    // A child match also keeps its parent, so nested hits count two nodes.
    expect(countTreePages(filterContentTree(groups, "leadership"))).toBe(2);
    expect(countTreePages(filterContentTree(groups, "privacy-policy"))).toBe(1);
    expect(countTreePages(filterContentTree(groups, "rigorous"))).toBe(2);
  });

  it("keeps the parent visible when only a child matches", () => {
    const filtered = filterContentTree(groups, "our-story");
    const about = filtered[0].nodes.find((n) => n.slug === "about")!;

    expect(about.children.map((c) => c.slug)).toEqual(["about/our-story"]);
  });

  it("drops groups with no matches", () => {
    expect(filterContentTree(groups, "zzzz")).toEqual([]);
  });
});
