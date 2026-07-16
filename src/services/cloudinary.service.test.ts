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

  it("signs staging uploads inside the staging namespace", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    vi.stubEnv("DEMO_MODE", "false");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-api-key");
    vi.stubEnv(
      "CLOUDINARY_API_SECRET",
      "test-api-secret-value"
    );

    const cloudinaryService = await import("./cloudinary.service");

    const result =
      cloudinaryService.generateUploadSignature(
        "seven-seas-cms"
      );

    expect(result.folder).toBe(
      "staging/seven-seas-cms"
    );
  });

  it("prefixes server-side staging uploads in QA mode", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    vi.stubEnv("QA_MODE", "true");

    const cloudinaryService = await import("./cloudinary.service");

    const result =
      await cloudinaryService.uploadBufferToCloudinary(
        Buffer.from("test"),
        "candidate-document",
        "seven-seas-candidates",
        true
      );

    expect(result.publicId).toBe(
      "staging/seven-seas-candidates/candidate-document"
    );

    expect(result.secureUrl).toContain(
      "/staging/seven-seas-candidates/"
    );
  });

  it("keeps production uploads unprefixed", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "");
    vi.stubEnv("DEMO_MODE", "false");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-api-key");
    vi.stubEnv(
      "CLOUDINARY_API_SECRET",
      "test-api-secret-value"
    );

    const cloudinaryService = await import("./cloudinary.service");

    const result =
      cloudinaryService.generateUploadSignature(
        "seven-seas-cms"
      );

    expect(result.folder).toBe("seven-seas-cms");
  });

  it("refuses to delete a shared legacy candidate asset in staging", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    vi.stubEnv("DEMO_MODE", "false");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-api-key");
    vi.stubEnv(
      "CLOUDINARY_API_SECRET",
      "test-api-secret-value"
    );

    const cloudinaryService = await import("./cloudinary.service");

    await expect(
      cloudinaryService.deletePrivateAsset(
        "seven-seas-candidates/legacy-doc"
      )
    ).resolves.toBe(false);
  });

  it("refuses to sign a shared legacy private asset in staging", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    vi.stubEnv("DEMO_MODE", "false");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-api-key");
    vi.stubEnv(
      "CLOUDINARY_API_SECRET",
      "test-api-secret-value"
    );

    const cloudinaryService = await import("./cloudinary.service");

    expect(() =>
      cloudinaryService.getSignedDocumentUrl(
        "seven-seas-candidates/legacy-doc"
      )
    ).toThrow(
      "Cloudinary public ID is outside the approved environment namespace."
    );
  });

  it("extracts nested Cloudinary public ids from legacy urls", async () => {
    const cloudinaryService = await import("./cloudinary.service");

    expect(
      cloudinaryService.extractCloudinaryPublicIdFromUrl(
        "https://res.cloudinary.com/demo/raw/private/v1720/staging/seven-seas-candidates/folder/doc.pdf"
      )
    ).toEqual({
      publicId: "staging/seven-seas-candidates/folder/doc",
      format: "pdf",
    });
  });
});
