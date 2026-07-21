import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("content resolver", () => {
  it("uses the demo repository only in allowed demo environments", async () => {
    vi.resetModules();
    vi.stubEnv("APP_ENV", "qa");
    vi.stubEnv("DEMO_MODE", "true");

    const qaModule = await import("./content-resolver");
    expect(qaModule.getContentRepository().constructor.name).toBe(
      "DemoContentRepository"
    );

    vi.resetModules();
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");

    const productionModule = await import("./content-resolver");
    expect(
      productionModule.getContentRepository().constructor.name
    ).toBe("PrismaContentRepository");
  });
});
