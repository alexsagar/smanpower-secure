import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We hoist mocks so they apply when the route module is imported.
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    demand: { findUnique: vi.fn() },
    candidateProfile: { findMany: vi.fn(), create: vi.fn() }
  }
}));

describe("Applications Integration Tests", () => {
  const originalEnv = process.env.PUBLIC_APPLICATIONS_ENABLED;
  let applyToDemandAction: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Dynamically import the action so it picks up the active mocks
    const actionsModule = await import("../../src/actions/demands");
    applyToDemandAction = actionsModule.applyToDemandAction;
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env.PUBLIC_APPLICATIONS_ENABLED = originalEnv;
  });

  it("PUBLIC_APPLICATIONS_ENABLED=false blocks submission", async () => {
    process.env.PUBLIC_APPLICATIONS_ENABLED = "false";
    const formData = new FormData();
    const result = await applyToDemandAction(null, formData);
    expect(result.success).toBe(false);
    expect(result.formError).toBe("APPLICATIONS_NOT_ENABLED");
  });

  it("Missing variable blocks submission", async () => {
    delete process.env.PUBLIC_APPLICATIONS_ENABLED;
    const formData = new FormData();
    const result = await applyToDemandAction(null, formData);
    expect(result.success).toBe(false);
    expect(result.formError).toBe("APPLICATIONS_NOT_ENABLED");
  });

  it("Invalid value blocks submission", async () => {
    process.env.PUBLIC_APPLICATIONS_ENABLED = "random";
    const formData = new FormData();
    const result = await applyToDemandAction(null, formData);
    expect(result.success).toBe(false);
    expect(result.formError).toBe("APPLICATIONS_NOT_ENABLED");
  });
});
