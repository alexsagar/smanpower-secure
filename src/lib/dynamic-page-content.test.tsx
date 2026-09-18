import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildDynamicPageBlockContent,
  mapBlockContentToPageContent,
} from "@/lib/dynamic-page-content";
import {
  employersContent,
  ethicalContent,
  industriesContent,
  trainingContent,
  trustContent,
  type PageContent,
} from "@/lib/content";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

vi.mock("server-only", () => ({}));

const ALL_PAGES: Array<[string, PageContent]> = [
  ...employersContent.map((c) => ["employers", c] as [string, PageContent]),
  ...ethicalContent.map((c) => ["ethical-recruitment", c] as [string, PageContent]),
  ...industriesContent.map((c) => ["industries", c] as [string, PageContent]),
  ...trainingContent.map((c) => ["training-facilities", c] as [string, PageContent]),
  ...trustContent.map((c) => ["trust-centre", c] as [string, PageContent]),
];

/**
 * Content safety guard for the CMS migration.
 *
 * The live site is the source of truth. Storing a page in the CMS and reading it
 * back must produce byte-identical markup to rendering the hardcoded record, or
 * the migration has changed what visitors see.
 */
describe("dynamic page CMS round-trip", () => {
  it("covers every hardcoded page", () => {
    expect(ALL_PAGES.length).toBe(32);
  });

  it.each(ALL_PAGES)("renders %s/%s identically via the CMS", (_category, entry) => {
    const stored = buildDynamicPageBlockContent(entry);
    // The migration writes `stored`; the route reads it back through the mapper.
    const roundTripped = mapBlockContentToPageContent(entry.slug, stored);

    const fromHardcoded = renderToStaticMarkup(
      <DynamicPageTemplate content={entry} />
    );
    const fromCms = renderToStaticMarkup(
      <DynamicPageTemplate content={roundTripped} />
    );

    expect(fromCms).toBe(fromHardcoded);
  });
});

describe("absent vs empty content", () => {
  // DynamicPageTemplate renders a standard fallback paragraph when missionText
  // is undefined, but an empty list when it is []. Empty arrays must therefore
  // collapse back to undefined or pages without paragraphs change visibly.
  it("collapses empty stored arrays back to undefined", () => {
    const mapped = mapBlockContentToPageContent("workforce-intelligence", {
      title: "Workforce Intelligence & Analytics.",
      subtitle: "Intelligence",
      heroImage: "/images/x.png",
      missionHeading: "",
      paragraphs: [],
      features: [],
      documents: [],
    });

    expect(mapped.missionText).toBeUndefined();
    expect(mapped.features).toBeUndefined();
    expect(mapped.documents).toBeUndefined();
    expect(mapped.missionHeading).toBeUndefined();
  });

  it("preserves populated arrays", () => {
    const mapped = mapBlockContentToPageContent("x", {
      paragraphs: ["One.", "Two."],
      features: [{ title: "T", desc: "D" }],
      documents: [{ title: "Doc", image: "/a.png" }],
    });

    expect(mapped.missionText).toEqual(["One.", "Two."]);
    expect(mapped.features).toEqual([{ title: "T", desc: "D" }]);
    expect(mapped.documents).toEqual([{ title: "Doc", image: "/a.png" }]);
  });
});

describe("fallback precedence", () => {
  const fallback = employersContent[0];

  it("prefers CMS values over the hardcoded record", () => {
    const mapped = mapBlockContentToPageContent(
      fallback.slug,
      { title: "Edited In CMS" },
      fallback
    );

    expect(mapped.title).toBe("Edited In CMS");
  });

  it("falls back field-by-field when the CMS value is blank", () => {
    const mapped = mapBlockContentToPageContent(fallback.slug, { title: "  " }, fallback);

    expect(mapped.title).toBe(fallback.title);
    expect(mapped.subtitle).toBe(fallback.subtitle);
    expect(mapped.heroImage).toBe(fallback.heroImage);
  });
});
