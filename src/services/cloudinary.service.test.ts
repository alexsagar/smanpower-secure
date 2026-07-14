import { beforeEach, describe, expect, it, vi } from "vitest";

describe("cloudinary service hardening", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("does not bypass production-like signature validation when demo is requested", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("CLOUDINARY_API_KEY", "");
    vi.stubEnv("CLOUDINARY_API_SECRET", "");

    const cloudinaryService = await import("./cloudinary.service");

    expect(() =>
      cloudinaryService.generateUploadSignature("seven-seas-cms")
    ).toThrow("Cloudinary environment variables are missing.");
  });

  it("returns an unconfirmed result when private deletion cannot be verified", async () => {
    vi.stubEnv("APP_ENV", "qa");
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("CLOUDINARY_API_KEY", "");
    vi.stubEnv("CLOUDINARY_API_SECRET", "");

    const cloudinaryService = await import("./cloudinary.service");

    await expect(
      cloudinaryService.deletePrivateAsset("private/doc")
    ).resolves.toBe(false);
  });
});
