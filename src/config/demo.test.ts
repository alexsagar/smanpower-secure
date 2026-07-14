import { describe, expect, it, vi } from "vitest";

describe("demo configuration", () => {
  it("allows demo mode only in local and qa app environments", async () => {
    vi.resetModules();
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("APP_ENV", "qa");

    const qaDemo = await import("./demo");
    expect(qaDemo.DEMO_MODE_REQUESTED).toBe(true);
    expect(qaDemo.DEMO_MODE).toBe(true);

    vi.resetModules();
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("APP_ENV", "production");

    const productionDemo = await import("./demo");
    expect(productionDemo.DEMO_MODE_REQUESTED).toBe(true);
    expect(productionDemo.DEMO_MODE).toBe(false);
  });

  it("marks only local and qa as allowed demo environments", async () => {
    const demo = await import("./demo");

    expect(demo.isDemoEnvironmentAllowed("local")).toBe(true);
    expect(demo.isDemoEnvironmentAllowed("qa")).toBe(true);
    expect(demo.isDemoEnvironmentAllowed("staging")).toBe(false);
    expect(demo.isDemoEnvironmentAllowed("production")).toBe(false);
  });
});
