import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";
import robots from "./robots";
import sitemap from "./sitemap";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("@/lib/seo/site-config", () => ({
  getSiteUrl: () => "https://staging.smanpower.com",
}));

describe("staging search protection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not add X-Robots-Tag when staging protection is disabled", async () => {
    vi.stubEnv("STAGING_NOINDEX", "false");

    await expect(nextConfig.headers?.()).resolves.toEqual([]);
  });

  it("adds X-Robots-Tag when staging protection is enabled", async () => {
    vi.stubEnv("STAGING_NOINDEX", "true");

    await expect(nextConfig.headers?.()).resolves.toEqual([
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ]);
  });

  it("blocks robots and omits sitemap entries on staging", async () => {
    vi.stubEnv("STAGING_NOINDEX", "true");

    expect(robots()).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
    await expect(sitemap()).resolves.toEqual([]);
  });
});
