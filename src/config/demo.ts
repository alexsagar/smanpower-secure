// ============================================================
// Seven Seas Intercontinental — Demo Mode Configuration
// ============================================================
// DEMO_MODE determines whether the application reads content from
// structured demo fixture files or from a PostgreSQL database via Prisma.
//
// Rules:
//   - Demo data is allowed only in explicitly non-production app environments.
//   - If DEMO_MODE env var is "true" outside an allowed environment, fail closed.
//   - Never bypass production path validation merely because DEMO_MODE was requested.
// ============================================================

const DEMO_APP_ENVS = new Set(["local", "qa"]);

export const DEMO_MODE_REQUESTED = process.env.DEMO_MODE === "true";

export function isDemoEnvironmentAllowed(appEnv: string | undefined = process.env.APP_ENV): boolean {
  return DEMO_APP_ENVS.has((appEnv || "").toLowerCase());
}

export const DEMO_MODE = DEMO_MODE_REQUESTED && isDemoEnvironmentAllowed();

export function demoFallback<T>(demoValue: T, safeValue: T): T {
  return DEMO_MODE ? demoValue : safeValue;
}

/**
 * Check whether Cloudinary credentials are configured.
 * When false, media operations use local demo assets.
 */
export const CLOUDINARY_CONFIGURED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;
