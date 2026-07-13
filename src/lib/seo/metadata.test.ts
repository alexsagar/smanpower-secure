import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPageMetadata } from "./metadata";

vi.mock("./site-config", () => ({
  getSiteUrl: () => "https://smanpower.com",
  siteConfig: {
    name: "Seven Seas Intercontinental",
    description: "Global Manpower Recruitment and HR Solutions",
  },
}));

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
