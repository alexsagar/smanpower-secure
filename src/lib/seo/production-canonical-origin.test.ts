import { describe, it, expect, afterEach, vi } from "vitest";
import { getSiteUrl } from "@/lib/seo/site-config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/schema";

describe("Production Canonical Origin & Localhost Leakage Guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getSiteUrl in production", () => {
    it("anchors to https://smanpower.com when APP_ENV=production even if SITE_URL is unset", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("SITE_URL", "");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

      expect(getSiteUrl()).toBe("https://smanpower.com");
    });

    it("rejects http://localhost in production and falls back to https://smanpower.com", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("SITE_URL", "http://localhost:3000");

      expect(getSiteUrl()).toBe("https://smanpower.com");
    });

    it("rejects 127.0.0.1 in production and falls back to https://smanpower.com", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("SITE_URL", "http://127.0.0.1:3000");

      expect(getSiteUrl()).toBe("https://smanpower.com");
    });

    it("returns https://smanpower.com when properly configured in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("SITE_URL", "https://smanpower.com");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://smanpower.com");

      expect(getSiteUrl()).toBe("https://smanpower.com");
    });

    it("uses http://localhost:3000 only in local development when SITE_URL is not set", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("APP_ENV", "local");
      vi.stubEnv("SITE_URL", "");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

      expect(getSiteUrl()).toBe("http://localhost:3000");
    });
  });

  describe("Metadata & Schema use production origin", () => {
    it("buildPageMetadata emits canonical and Open Graph URLs with https://smanpower.com", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("SITE_URL", "https://smanpower.com");

      const meta = buildPageMetadata({
        title: "About Us",
        path: "/about",
      });

      expect(meta.alternates?.canonical).toBe("https://smanpower.com/about");
      expect(meta.openGraph?.url).toBe("https://smanpower.com/about");
      expect(JSON.stringify(meta)).not.toContain("localhost");
      expect(JSON.stringify(meta)).not.toContain("127.0.0.1");
    });

    it("buildOrganizationSchema uses https://smanpower.com for @id, url, and logo", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("SITE_URL", "https://smanpower.com");

      const schema = buildOrganizationSchema({
        companyName: "Seven Seas Intercontinental",
      });

      expect(schema?.["@id"]).toBe("https://smanpower.com/#organization");
      expect(schema?.url).toBe("https://smanpower.com");
      expect(schema?.logo).toContain("https://smanpower.com/");
      expect(JSON.stringify(schema)).not.toContain("localhost");
      expect(JSON.stringify(schema)).not.toContain("127.0.0.1");
    });

    it("buildWebSiteSchema uses https://smanpower.com for @id, url, and searchAction", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("SITE_URL", "https://smanpower.com");

      const schema = buildWebSiteSchema();

      expect(schema?.["@id"]).toBe("https://smanpower.com/#website");
      expect(schema?.url).toBe("https://smanpower.com");
      expect(schema?.potentialAction.target.urlTemplate).toContain("https://smanpower.com/search");
      expect(JSON.stringify(schema)).not.toContain("localhost");
      expect(JSON.stringify(schema)).not.toContain("127.0.0.1");
    });
  });
});
