import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertProductionEnv,
  getMissingProductionEnv,
  isStagingNoIndexEnabled,
  REQUIRED_PRODUCTION_ENV,
  REQUIRED_STAGING_ENV,
} from "./env";

describe("environment foundation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects staging noindex only when enabled", () => {
    vi.stubEnv("STAGING_NOINDEX", "true");
    expect(isStagingNoIndexEnabled()).toBe(true);

    vi.stubEnv("STAGING_NOINDEX", "false");
    expect(isStagingNoIndexEnabled()).toBe(false);
  });

  it("reports missing production variables clearly", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DEMO_MODE", "false");
    for (const name of REQUIRED_PRODUCTION_ENV) {
      vi.stubEnv(name, "");
    }

    expect(getMissingProductionEnv()).toEqual([...REQUIRED_PRODUCTION_ENV]);
    expect(() => assertProductionEnv()).toThrow(
      `Missing required production environment variables: ${REQUIRED_PRODUCTION_ENV.join(", ")}`
    );
  });

  it("still requires production variables when demo mode is requested in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");
    for (const name of REQUIRED_PRODUCTION_ENV) {
      vi.stubEnv(name, "");
    }

    expect(getMissingProductionEnv()).toEqual([...REQUIRED_PRODUCTION_ENV]);
    expect(() => assertProductionEnv()).toThrow();
  });

  it("still requires production variables when demo mode is requested in qa app env under a production node runtime", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "qa");
    vi.stubEnv("DEMO_MODE", "true");
    for (const name of REQUIRED_PRODUCTION_ENV) {
      vi.stubEnv(name, "");
    }

    expect(getMissingProductionEnv()).toEqual([...REQUIRED_PRODUCTION_ENV]);
    expect(() => assertProductionEnv()).toThrow();
  });

  it("requires the Cloudinary namespace for staging deployments", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("DEMO_MODE", "false");

    for (const name of REQUIRED_PRODUCTION_ENV) {
      vi.stubEnv(name, `${name.toLowerCase()}-set`);
    }

    for (const name of REQUIRED_STAGING_ENV) {
      vi.stubEnv(name, "");
    }

    expect(getMissingProductionEnv()).toEqual([
      "CLOUDINARY_FOLDER_PREFIX",
    ]);
    expect(() => assertProductionEnv()).toThrow(
      "Missing required production environment variables: CLOUDINARY_FOLDER_PREFIX"
    );
  });

  it("accepts a staging runtime when the required deployment variables are present", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("DEMO_MODE", "false");

    for (const name of REQUIRED_PRODUCTION_ENV) {
      vi.stubEnv(name, `${name.toLowerCase()}-set`);
    }

    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");

    expect(getMissingProductionEnv()).toEqual([]);
    expect(() => assertProductionEnv()).not.toThrow();
  });

  it("rejects a production runtime configured with the staging namespace", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DEMO_MODE", "false");

    for (const name of REQUIRED_PRODUCTION_ENV) {
      vi.stubEnv(name, `${name.toLowerCase()}-set`);
    }

    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");

    expect(getMissingProductionEnv()).toEqual([]);
    expect(() => assertProductionEnv()).toThrow(
      "Production must not use CLOUDINARY_FOLDER_PREFIX."
    );
  });
});
