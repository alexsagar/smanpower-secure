import { afterEach, describe, expect, it, vi } from "vitest";

describe("verifyTurnstileToken", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("passes immediately when turnstile is disabled, even in qa mode", async () => {
    vi.stubEnv("TURNSTILE_ENABLED", "false");
    vi.stubEnv("QA_MODE", "true");

    const { verifyTurnstileToken } = await import("./turnstile.service");

    await expect(verifyTurnstileToken(null, "candidate_application")).resolves.toEqual({
      success: true,
    });
  });
});
