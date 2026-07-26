import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPageMetadata, buildBrandedTitle } from "./metadata";

vi.mock("./site-config", () => ({
  getSiteUrl: () => "https://smanpower.com",
  siteConfig: {
    name: "Seven Seas Intercontinental",
    brandStem: "Seven Seas",
    description: "Global Manpower Recruitment and HR Solutions",
  },
}));

describe("buildBrandedTitle", () => {
  it("appends the site name when the title has no brand", () => {
    expect(buildBrandedTitle("Pre-Departure Training Nepal")).toBe(
      "Pre-Departure Training Nepal | Seven Seas Intercontinental"
    );
  });

  it("does not double the brand when the title already carries it", () => {
    expect(buildBrandedTitle("Contact Us | Seven Seas Intercontinental")).toBe(
      "Contact Us | Seven Seas Intercontinental"
    );
    // A brand variant, not the exact site name — this is what produced
    // "… | Seven Seas Nepal | Seven Seas Intercontinental".
    expect(buildBrandedTitle("Success Stories | Seven Seas Nepal")).toBe(
      "Success Stories | Seven Seas Nepal"
    );
  });

  it("falls back to the site name for empty titles", () => {
    expect(buildBrandedTitle()).toBe("Seven Seas Intercontinental");
    expect(buildBrandedTitle("   ")).toBe("Seven Seas Intercontinental");
  });
});

describe("metadata staging noindex", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not noindex production metadata by default", () => {
    vi.stubEnv("STAGING_NOINDEX", "false");

    const metadata = buildPageMetadata({ title: "About", path: "/about" });

    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    });
  });

  it("adds noindex metadata when staging protection is enabled", () => {
    vi.stubEnv("STAGING_NOINDEX", "true");

    const metadata = buildPageMetadata({ title: "About", path: "/about" });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
  });
});
