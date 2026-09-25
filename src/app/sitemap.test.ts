import { afterEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    demand: { findMany },
    insightArticle: { findMany },
    newsArticle: { findMany },
    careerOpening: { findMany },
    successStory: { findMany },
    cmsPage: { findMany },
  },
}));

vi.mock("@/lib/seo/site-config", () => ({
  getSiteUrl: () => "https://smanpower.com",
}));

describe("sitemap", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("emits canonical root URLs only with no /en or /ne duplicates", async () => {
    vi.stubEnv("STAGING_NOINDEX", "false");
    vi.stubEnv("DEMO_MODE", "false");

    findMany
      .mockResolvedValueOnce([{ slug: "sample-demand", updatedAt: new Date("2026-07-01"), publishedAt: new Date("2026-07-01") }])
      .mockResolvedValueOnce([{ slug: "sample-insight", updatedAt: new Date("2026-07-02"), publishDate: new Date("2026-07-02") }])
      .mockResolvedValueOnce([{ slug: "sample-news", updatedAt: new Date("2026-07-03"), publishDate: new Date("2026-07-03") }])
      .mockResolvedValueOnce([{ slug: "sample-career", updatedAt: new Date("2026-07-04") }])
      .mockResolvedValueOnce([{ slug: "sample-story", updatedAt: new Date("2026-07-05"), publishedAt: new Date("2026-07-05") }])
      .mockResolvedValueOnce([
        { slug: "about", updatedAt: new Date("2026-07-06") },
        { slug: "custom-page", updatedAt: new Date("2026-07-07") },
        { slug: "home", updatedAt: new Date("2026-07-08") },
        { slug: "layout", updatedAt: new Date("2026-07-08") },
        { slug: "demands/detail", updatedAt: new Date("2026-07-08") },
        { slug: "destinations", updatedAt: new Date("2026-07-09") },
        { slug: "manpower-agency-in-kathmandu", updatedAt: new Date("2026-07-09") },
      ]);

    const { default: sitemap } = await import("./sitemap");
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://smanpower.com/");
    expect(urls).toContain("https://smanpower.com/about");
    expect(urls).toContain("https://smanpower.com/about/our-story");
    expect(urls).toContain("https://smanpower.com/privacy-policy");
    expect(urls).toContain("https://smanpower.com/terms-of-service");
    expect(urls).toContain("https://smanpower.com/worker-grievance");
    expect(urls).toContain("https://smanpower.com/employers/request-workforce");
    expect(urls).toContain("https://smanpower.com/demands/sample-demand");
    expect(urls).toContain("https://smanpower.com/insights/sample-insight");
    expect(urls).toContain("https://smanpower.com/news/sample-news");
    expect(urls).toContain("https://smanpower.com/careers/sample-career");
    expect(urls).toContain("https://smanpower.com/success-stories/sample-story");
    expect(urls).toContain("https://smanpower.com/custom-page");
    expect(urls).toContain("https://smanpower.com/industries/security-services");
    expect(urls).toContain("https://smanpower.com/training-facilities/training-centres");
    expect(urls).toContain("https://smanpower.com/employers/candidate-sourcing");
    expect(urls).toContain("https://smanpower.com/ethical-recruitment/rba-aligned-practices");
    expect(urls).toContain("https://smanpower.com/trust-centre/licences");
    expect(urls).not.toContain("https://smanpower.com/about/about");
    expect(urls.some((url) => url.includes("/en/"))).toBe(false);
    expect(urls.some((url) => url.includes("/ne/"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/job-seekers"))).toBe(false);

    // Search and utility CMS slugs must never appear in the sitemap.
    expect(urls).not.toContain("https://smanpower.com/search");
    expect(urls).not.toContain("https://smanpower.com/home");
    expect(urls).not.toContain("https://smanpower.com/layout");
    expect(urls).not.toContain("https://smanpower.com/demands/detail");

    // Destination and Kathmandu pages appear exactly once each, even though a
    // published CmsPage row exists for the same top-level slug.
    for (const path of [
      "/destinations",
      "/destinations/saudi-arabia",
      "/destinations/united-arab-emirates",
      "/destinations/qatar",
      "/destinations/cyprus",
      "/manpower-agency-in-kathmandu",
    ]) {
      const url = `https://smanpower.com${path}`;
      expect(urls.filter((u) => u === url)).toHaveLength(1);
    }
    expect(urls).toHaveLength(new Set(urls).size);

    // Static routes carry no real timestamp, so no artificial lastModified.
    const root = entries.find((e) => e.url === "https://smanpower.com/");
    expect(root?.lastModified).toBeUndefined();
    // Dynamic records keep their genuine database timestamp.
    const demand = entries.find((e) => e.url === "https://smanpower.com/demands/sample-demand");
    expect(demand?.lastModified).toBeInstanceOf(Date);

    // Expired and soft-deleted demands are filtered at the query level:
    // only PUBLISHED, public, non-deleted, non-expired demands are requested.
    const demandCall = findMany.mock.calls.find(
      (call) => call[0]?.where?.status === "PUBLISHED" && call[0]?.where?.deletedAt === null
    );
    expect(demandCall).toBeTruthy();
    expect(demandCall![0].where.OR).toEqual([
      { applicationDeadline: null },
      { applicationDeadline: { gte: expect.any(Date) } },
    ]);
  });
});
