import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/seo/site-config", () => ({ getSiteUrl: () => "https://smanpower.com" }));

describe("robots", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("allows search + retrieval crawlers, blocks training crawlers, protects private routes", async () => {
    vi.stubEnv("STAGING_NOINDEX", "false");
    const { default: robots } = await import("./robots");
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    const wildcard = rules.find((r) => r.userAgent === "*")!;
    expect(wildcard.allow).toBe("/");
    // Private routes disallowed for everyone.
    for (const p of ["/admin/", "/api/", "/login/", "/*/apply/", "/*preview*"]) {
      expect(wildcard.disallow).toContain(p);
    }

    const blocked = (ua: string) => rules.some((r) => r.userAgent === ua && r.disallow === "/");
    // Training crawlers blocked.
    for (const ua of ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider"]) {
      expect(blocked(ua), `${ua} should be blocked`).toBe(true);
    }
    // Search/retrieval crawlers NOT given a block rule.
    for (const ua of ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Googlebot", "Bingbot", "Applebot"]) {
      expect(blocked(ua), `${ua} must not be blocked`).toBe(false);
    }

    expect(result.sitemap).toBe("https://smanpower.com/sitemap.xml");
  });

  it("disallows everything under staging noindex", async () => {
    vi.stubEnv("STAGING_NOINDEX", "true");
    vi.resetModules();
    const { default: robots } = await import("./robots");
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules[0]).toEqual({ userAgent: "*", disallow: "/" });
  });
});
