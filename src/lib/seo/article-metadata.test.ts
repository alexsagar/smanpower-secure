import { describe, expect, it, vi } from "vitest";
import { buildPageMetadata } from "./metadata";
import { buildArticleSchema, buildNewsArticleSchema } from "./schema";

vi.mock("./site-config", () => ({
  getSiteUrl: () => "https://smanpower.com",
  siteConfig: {
    name: "Seven Seas Intercontinental",
    brandStem: "Seven Seas",
    description: "Global Manpower Recruitment and HR Solutions",
  },
}));

describe("Insight Metadata & Schema", () => {
  it("generates correct title and canonical for an insight article", () => {
    const meta = buildPageMetadata({
      title: "Ethical Recruitment Agency in Nepal",
      path: "/insights/ethical-recruitment-agency-in-nepal",
    });

    expect(meta.title).toBe("Ethical Recruitment Agency in Nepal | Seven Seas Intercontinental");
    expect(meta.alternates?.canonical).toBe("https://smanpower.com/insights/ethical-recruitment-agency-in-nepal");
  });

  it("buildArticleSchema accepts Date object, string ISO, null, and invalid dates without throwing", () => {
    // 1. Date object input
    const schemaWithDate = buildArticleSchema({
      title: "Ethical Recruitment Agency in Nepal",
      slug: "ethical-recruitment-agency-in-nepal",
      publishDate: new Date("2025-01-15T10:00:00.000Z"),
      updatedAt: new Date("2025-02-20T14:30:00.000Z"),
    });
    expect(schemaWithDate?.["@type"]).toBe("BlogPosting");
    expect(schemaWithDate?.url).toBe("https://smanpower.com/insights/ethical-recruitment-agency-in-nepal");
    expect(schemaWithDate?.datePublished).toBe("2025-01-15T10:00:00.000Z");
    expect(schemaWithDate?.dateModified).toBe("2025-02-20T14:30:00.000Z");

    // 2. Deserialized JSON string input (from unstable_cache)
    const schemaWithString = buildArticleSchema({
      title: "Ethical Recruitment Agency in Nepal",
      slug: "ethical-recruitment-agency-in-nepal",
      publishDate: "2025-01-15T10:00:00.000Z",
      updatedAt: "2025-02-20T14:30:00.000Z",
    });
    expect(schemaWithString?.datePublished).toBe("2025-01-15T10:00:00.000Z");
    expect(schemaWithString?.dateModified).toBe("2025-02-20T14:30:00.000Z");

    // 3. Null and undefined dates
    const schemaWithNull = buildArticleSchema({
      title: "Ethical Recruitment Agency in Nepal",
      slug: "ethical-recruitment-agency-in-nepal",
      publishDate: null,
      updatedAt: undefined,
    });
    expect(schemaWithNull?.datePublished).toBeUndefined();
    expect(schemaWithNull?.dateModified).toBeUndefined();

    // 4. Invalid date string
    const schemaWithInvalid = buildArticleSchema({
      title: "Ethical Recruitment Agency in Nepal",
      slug: "ethical-recruitment-agency-in-nepal",
      publishDate: "invalid-date",
      updatedAt: "corrupted-date",
    });
    expect(schemaWithInvalid?.datePublished).toBeUndefined();
    expect(schemaWithInvalid?.dateModified).toBeUndefined();
  });
});

describe("News Metadata & Schema", () => {
  it("generates correct title and canonical for a news article", () => {
    const meta = buildPageMetadata({
      title: "Nepal Qatar Bilateral Labor Agreement",
      path: "/news/nepal-qatar-bilateral-labor-agreement-update-2025",
    });

    expect(meta.title).toBe("Nepal Qatar Bilateral Labor Agreement | Seven Seas Intercontinental");
    expect(meta.alternates?.canonical).toBe("https://smanpower.com/news/nepal-qatar-bilateral-labor-agreement-update-2025");
  });

  it("buildNewsArticleSchema accepts Date object, string ISO, null, and invalid dates without throwing", () => {
    // 1. Date object input
    const schemaWithDate = buildNewsArticleSchema({
      title: "Nepal Qatar Bilateral Labor Agreement",
      slug: "nepal-qatar-bilateral-labor-agreement-update-2025",
      publishDate: new Date("2025-03-01T08:00:00.000Z"),
      updatedAt: new Date("2025-03-02T09:00:00.000Z"),
    });
    expect(schemaWithDate?.["@type"]).toBe("NewsArticle");
    expect(schemaWithDate?.url).toBe("https://smanpower.com/news/nepal-qatar-bilateral-labor-agreement-update-2025");
    expect(schemaWithDate?.datePublished).toBe("2025-03-01T08:00:00.000Z");
    expect(schemaWithDate?.dateModified).toBe("2025-03-02T09:00:00.000Z");

    // 2. Deserialized JSON string input (from unstable_cache)
    const schemaWithString = buildNewsArticleSchema({
      title: "Nepal Qatar Bilateral Labor Agreement",
      slug: "nepal-qatar-bilateral-labor-agreement-update-2025",
      publishDate: "2025-03-01T08:00:00.000Z",
      updatedAt: "2025-03-02T09:00:00.000Z",
    });
    expect(schemaWithString?.datePublished).toBe("2025-03-01T08:00:00.000Z");
    expect(schemaWithString?.dateModified).toBe("2025-03-02T09:00:00.000Z");

    // 3. Null and undefined dates
    const schemaWithNull = buildNewsArticleSchema({
      title: "Nepal Qatar Bilateral Labor Agreement",
      slug: "nepal-qatar-bilateral-labor-agreement-update-2025",
      publishDate: null,
      updatedAt: undefined,
    });
    expect(schemaWithNull?.datePublished).toBeUndefined();
    expect(schemaWithNull?.dateModified).toBeUndefined();

    // 4. Invalid date string
    const schemaWithInvalid = buildNewsArticleSchema({
      title: "Nepal Qatar Bilateral Labor Agreement",
      slug: "nepal-qatar-bilateral-labor-agreement-update-2025",
      publishDate: "invalid-date",
      updatedAt: "corrupted-date",
    });
    expect(schemaWithInvalid?.datePublished).toBeUndefined();
    expect(schemaWithInvalid?.dateModified).toBeUndefined();
  });
});
