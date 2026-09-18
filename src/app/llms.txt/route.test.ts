import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/seo/site-config", () => ({ getSiteUrl: () => "https://smanpower.com" }));
vi.mock("@/repositories/content-resolver", () => {
  const settings = {
    companyName: "Seven Seas Intercontinental",
    tagline: "Responsible Recruitment.",
    website: "https://smanpower.com",
    city: "Kathmandu",
    country: "Nepal",
  };
  return {
    getSiteSettings: async () => settings,
    getContentRepository: () => ({
      getSiteSettings: async () => settings,
    }),
  };
});

describe("llms.txt", () => {
  it("uses apex URLs, a sitemap link, approved compliance wording, and no private/member claims", async () => {
    const { GET } = await import("./route");
    const body = await (await GET()).text();

    // Apex-only URLs, no www / private / applicant routes.
    expect(body).not.toMatch(/www\.smanpower\.com/);
    expect(body).not.toMatch(/\/admin|\/api\/|\/apply|preview|localhost|workers\.dev|vercel\.app/);
    // Every link is apex.
    for (const url of body.match(/https?:\/\/\S+/g) || []) {
      expect(url.startsWith("https://smanpower.com")).toBe(true);
    }

    // Sitemap reference + Kathmandu office.
    expect(body).toContain("Sitemap: https://smanpower.com/sitemap.xml");
    expect(body).toContain("Kathmandu, Nepal");
    // Key routes present.
    expect(body).toContain("https://smanpower.com/employers/request-workforce");
    expect(body).toContain("https://smanpower.com/worker-grievance");
    expect(body).toContain("https://smanpower.com/privacy-policy");

    // Approved compliance wording, no membership/certified-for-RBA-or-Sedex claims.
    expect(body).toMatch(/RBA-compliant/);
    expect(body).toMatch(/Sedex-compliant/);
    expect(body).toMatch(/ISO 9001:2015 certified/);
    expect(body).not.toMatch(/RBA member|Sedex member|RBA certified|Sedex certified/i);
  });
});
