import { beforeEach, describe, expect, it, vi } from "vitest";

describe("getSecurityHeaderEntries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("returns core security headers without hsts", async () => {
    const { getSecurityHeaderEntries } = await import("./security-headers");
    const headers = getSecurityHeaderEntries();
    const keys = headers.map((header) => header.key);

    expect(keys).toContain("Content-Security-Policy");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("Permissions-Policy");
    expect(keys).not.toContain("Strict-Transport-Security");
  });

  it("adds explicit no-referrer overrides for sensitive document routes", async () => {
    const { getSecurityHeaderConfig } = await import("./security-headers");
    const config = getSecurityHeaderConfig();

    expect(config).toContainEqual({
      source: "/api/documents/:path*",
      headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
    });
    expect(config).toContainEqual({
      source: "/api/admin/private-media-url",
      headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
    });
  });
});
