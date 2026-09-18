import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Legacy and Locale Redirects Configuration", () => {
  it("defines all verified legacy redirects with permanent (308) status", async () => {
    expect(nextConfig.redirects).toBeDefined();
    const redirects = await nextConfig.redirects!();

    const verifiedLegacyMappings: Record<string, string> = {
      "/page/about-us": "/about",
      "/page/we-supply": "/industries",
      "/page/recruitment-process": "/employers",
      "/page/demand-list": "/demands",
      "/page/re-advertisement": "/demands",
      "/contact-us": "/contact",
      "/document": "/trust-centre",
      "/home": "/",
      "/jobs": "/demands",
    };

    for (const [source, destination] of Object.entries(verifiedLegacyMappings)) {
      const match = redirects.find((r) => r.source === source);
      expect(match, `Redirect for ${source} should exist`).toBeDefined();
      expect(match?.destination).toBe(destination);
      expect(match?.permanent, `Redirect for ${source} must be permanent (308)`).toBe(true);
    }
  });

  it("does NOT contain a blanket wildcard /page/:path* -> /about redirect", async () => {
    const redirects = await nextConfig.redirects!();

    const blanketPageRedirect = redirects.find(
      (r) =>
        (r.source === "/page/:path*" || r.source === "/page/*") &&
        (r.destination === "/about" || r.destination === "/")
    );

    expect(blanketPageRedirect, "Blanket wildcard redirect for /page/* must NOT exist").toBeUndefined();
  });

  it("does NOT contain a redirect for /userfiles/files/Company_Profile.pdf", async () => {
    const redirects = await nextConfig.redirects!();

    const pdfRedirect = redirects.find((r) => r.source.includes("Company_Profile.pdf"));

    expect(pdfRedirect, "Company_Profile.pdf should not be redirected without verified replacement").toBeUndefined();
  });
});
