import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  destinationsContent,
  standaloneContent,
  getContentBySlug,
  INDICATIVE_TIMEFRAME,
  type PageContent,
} from "@/lib/content";
import {
  buildDynamicPageBlockContent,
  mapBlockContentToPageContent,
} from "@/lib/dynamic-page-content";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import { buildEmploymentAgencySchema } from "@/lib/seo/schema";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/seo/site-config", () => ({
  getSiteUrl: () => "https://smanpower.com",
  siteConfig: { name: "Seven Seas Intercontinental", brandStem: "Seven Seas", description: "" },
}));

const COUNTRY_SLUGS = ["saudi-arabia", "united-arab-emirates", "qatar"];
const ROOT_SLUGS = ["destinations", "manpower-agency-in-kathmandu"];

const resolved = (category: string, slug: string): PageContent => {
  const content = getContentBySlug(category, slug);
  expect(content, `${category}/${slug} must resolve`).toBeTruthy();
  return content!;
};

const allNewPages: Array<[string, PageContent]> = [
  ...COUNTRY_SLUGS.map((s) => ["destinations", resolved("destinations", s)] as [string, PageContent]),
  ...ROOT_SLUGS.map((s) => ["standalone", resolved("standalone", s)] as [string, PageContent]),
];

describe("destination and Kathmandu page content", () => {
  it("registers exactly the confirmed destinations", () => {
    expect(destinationsContent.map((c) => c.slug)).toEqual(COUNTRY_SLUGS);
    expect(standaloneContent.map((c) => c.slug)).toEqual(ROOT_SLUGS);
  });

  it.each(allNewPages)("%s page has a single H1 and substantive sections", (_category, page) => {
    const html = renderToStaticMarkup(<DynamicPageTemplate content={page} />);
    expect((html.match(/<h1/g) || []).length).toBe(1);
    expect(page.missionText?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(page.features?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(page.faqs?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(page.cta?.buttonHref).toBeTruthy();
  });

  it.each(allNewPages)("%s page emits FAQ markup only for visible FAQs", (_category, page) => {
    const html = renderToStaticMarkup(<DynamicPageTemplate content={page} />);
    const hasFaqSchema = html.includes('"FAQPage"');
    expect(hasFaqSchema).toBe((page.faqs?.length ?? 0) > 0);
    for (const faq of page.faqs ?? []) {
      // Every question in the markup is also rendered as visible text.
      expect(html).toContain(faq.q.replace(/&/g, "&amp;"));
    }
  });

  it.each(allNewPages)("%s page makes no unsupported factual claim", (_category, page) => {
    const text = JSON.stringify(page);
    const FORBIDDEN = [
      // Affirmative guarantees only — "an estimate rather than a guarantee" is
      // the disclaimer we require, not a claim.
      /\bwe guarantee\b/i,
      /\bguaranteed\b/i,
      /\bguarantees? (placement|deployment|employment|a job|jobs|delivery)\b/i,
      /\bsalary\b/i,
      /\bsalaries\b/i,
      /\bwage (range|of)\b/i,
      /\bvisa (requirement|procedure|rule|law)/i,
      /\bour (Dubai|Doha|Riyadh|Gulf) office\b/i,
      /\bworkers deployed to\b.*\b\d{3,}\b/i,
      /\bhreflang\b/i,
    ];
    for (const pattern of FORBIDDEN) {
      expect(pattern.test(text), `matched ${pattern}`).toBe(false);
    }
  });

  it("states the 30-45 day timeframe only as an indicative estimate", () => {
    expect(INDICATIVE_TIMEFRAME).toContain("30 to 45 days");
    expect(INDICATIVE_TIMEFRAME).toContain("estimate rather than a guarantee");

    for (const [, page] of allNewPages) {
      const text = JSON.stringify(page);
      if (/30 to 45 days|30–45|30-45/.test(text)) {
        expect(text).toContain("estimate rather than a guarantee");
      }
    }
  });

  it("uses 2010 as the establishment year and never repeats the 2008 milestone", () => {
    for (const [, page] of allNewPages) {
      const text = JSON.stringify(page);
      expect(text).not.toContain("2008");
      if (/established in/i.test(text)) {
        expect(text).toMatch(/established in 2010/);
      }
    }
  });

  it("keeps the approved compliance wording intact", () => {
    const text = JSON.stringify(allNewPages.map(([, p]) => p));
    expect(text).toContain("ISO 9001:2015 certified Quality Management System");
    expect(text).toContain("RBA-compliant and Sedex-compliant");
    expect(text).toContain("Employer-Pays Principle");
    expect(text).not.toMatch(/RBA[-\s]certified|Sedex[-\s]certified|RBA member|Sedex member/i);
  });

  it("routes jobseekers to demands and employers to the request form", () => {
    const kathmandu = resolved("standalone", "manpower-agency-in-kathmandu");
    const hrefs = (kathmandu.links ?? []).map((l) => l.href);
    expect(hrefs).toContain("/demands");
    expect(hrefs).toContain("/employers/request-workforce");
    expect(kathmandu.cta?.secondaryHref).toBe("/demands");
    // Jobseekers must never be pushed at the employer enquiry form.
    expect(JSON.stringify(kathmandu)).not.toContain("/contact");
  });

  it("links the destination overview to every country page", () => {
    const overview = resolved("standalone", "destinations");
    const hrefs = (overview.links ?? []).map((l) => l.href);
    for (const slug of COUNTRY_SLUGS) {
      expect(hrefs).toContain(`/destinations/${slug}`);
    }
  });

  it.each(allNewPages)("%s page survives a CMS round-trip unchanged", (_category, page) => {
    const stored = buildDynamicPageBlockContent(page);
    const roundTripped = mapBlockContentToPageContent(page.slug, stored);
    expect(renderToStaticMarkup(<DynamicPageTemplate content={roundTripped} />)).toBe(
      renderToStaticMarkup(<DynamicPageTemplate content={page} />)
    );
  });
});

describe("Kathmandu office structured data", () => {
  it("emits only verified, page-visible fields", () => {
    const schema = buildEmploymentAgencySchema({
      canonicalUrl: "https://smanpower.com/manpower-agency-in-kathmandu",
      name: "Seven Seas Intercontinental",
      streetAddress: "DAI Complex, Panchakanya Marga, Guheswori",
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati Province",
      postalCode: "44600",
      addressCountry: "NP",
      telephone: "+977 1 5107440",
      email: "info@smanpower.com",
    }) as Record<string, unknown> | null;

    expect(schema?.["@type"]).toBe("EmploymentAgency");
    // Unconfirmed details must be absent, not invented.
    expect(schema).not.toHaveProperty("openingHours");
    expect(schema).not.toHaveProperty("openingHoursSpecification");
    expect(schema).not.toHaveProperty("geo");
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("review");
    expect(schema).not.toHaveProperty("sameAs");
  });
});
