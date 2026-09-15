import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

// Mock prisma before importing the pages
vi.mock("@/lib/prisma", () => ({
  prisma: {
    insightArticle: {
      findFirst: vi.fn().mockImplementation(() =>
        Promise.resolve({
          title: "Choosing a Manpower Agency in Nepal",
          slug: "choose-manpower-agency-in-nepal",
          metaTitle: "Choosing a Manpower Agency in Nepal",
          metaDescription: "Comprehensive guide for international employers",
          summary: "Comprehensive guide for international employers",
          canonicalUrl: null,
          publishDate: "2025-01-15T00:00:00.000Z", // Cached deserialized JSON string!
          updatedAt: "2025-02-01T00:00:00.000Z",   // Cached deserialized JSON string!
          author: { name: "Seven Seas Editorial" },
          category: { name: "Recruitment" },
          featuredImage: null,
          ogImage: null,
          noIndex: false,
          content: "<p>Article content test body</p>",
        })
      ),
      findMany: vi.fn().mockResolvedValue([]),
    },
    newsArticle: {
      findFirst: vi.fn().mockImplementation(() =>
        Promise.resolve({
          title: "Nepal-Qatar Bilateral Labor Agreement Update",
          slug: "nepal-qatar-bilateral-labor-agreement-update-2025",
          metaTitle: "Nepal-Qatar Bilateral Labor Agreement Update",
          metaDescription: "Official update on bilateral labor agreement",
          summary: "Official update on bilateral labor agreement",
          publishDate: "2025-03-01T00:00:00.000Z", // Cached deserialized JSON string!
          updatedAt: "2025-03-02T00:00:00.000Z",   // Cached deserialized JSON string!
          author: { name: "Corporate Desk" },
          featuredMedia: null,
          featuredImage: null,
          ogImage: null,
          noIndex: false,
          content: "<p>News content test body</p>",
        })
      ),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@/lib/seo/site-config", () => ({
  getSiteUrl: () => "https://smanpower.com",
  siteConfig: {
    name: "Seven Seas Intercontinental",
    brandStem: "Seven Seas",
    description: "Global Manpower Recruitment and HR Solutions",
  },
}));

import { generateMetadata as generateInsightMetadata } from "./insights/[slug]/page";
import { generateMetadata as generateNewsMetadata } from "./news/[slug]/page";

describe("Page generateMetadata with cached string dates", () => {
  it("generates insight metadata without throwing when dates are JSON strings", async () => {
    const meta = await generateInsightMetadata({
      params: Promise.resolve({ slug: "choose-manpower-agency-in-nepal" }),
    });

    expect(meta.title).toBe("Choosing a Manpower Agency in Nepal | Seven Seas Intercontinental");
    expect(meta.description).toBe("Comprehensive guide for international employers");
    expect((meta.alternates as any)?.canonical).toBe(
      "https://smanpower.com/insights/choose-manpower-agency-in-nepal"
    );
    expect((meta.openGraph as any)?.type).toBe("article");
    expect((meta.openGraph as any)?.publishedTime).toBe("2025-01-15T00:00:00.000Z");
    expect((meta.openGraph as any)?.modifiedTime).toBe("2025-02-01T00:00:00.000Z");
  });

  it("generates news metadata without throwing when dates are JSON strings", async () => {
    const meta = await generateNewsMetadata({
      params: Promise.resolve({
        slug: "nepal-qatar-bilateral-labor-agreement-update-2025",
      }),
    });

    expect(meta.title).toBe(
      "Nepal-Qatar Bilateral Labor Agreement Update | Seven Seas Intercontinental"
    );
    expect(meta.description).toBe("Official update on bilateral labor agreement");
    expect((meta.alternates as any)?.canonical).toBe(
      "https://smanpower.com/news/nepal-qatar-bilateral-labor-agreement-update-2025"
    );
    expect((meta.openGraph as any)?.type).toBe("article");
    expect((meta.openGraph as any)?.publishedTime).toBe("2025-03-01T00:00:00.000Z");
    expect((meta.openGraph as any)?.modifiedTime).toBe("2025-03-02T00:00:00.000Z");
  });
});

import InsightDetailPage from "./insights/[slug]/page";
import NewsDetailPage from "./news/[slug]/page";

describe("Page Components with cached string dates", () => {
  it("renders InsightDetailPage successfully without throwing SSR date exceptions", async () => {
    const page = await InsightDetailPage({
      params: Promise.resolve({ slug: "choose-manpower-agency-in-nepal" }),
    });

    expect(page).toBeDefined();
  });

  it("renders NewsDetailPage successfully without throwing SSR date exceptions", async () => {
    const page = await NewsDetailPage({
      params: Promise.resolve({
        slug: "nepal-qatar-bilateral-labor-agreement-update-2025",
      }),
    });

    expect(page).toBeDefined();
  });
});

