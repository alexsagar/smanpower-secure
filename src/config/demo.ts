// ============================================================
// Seven Seas Intercontinental — Demo Mode Configuration
// ============================================================
// DEMO_MODE determines whether the application reads content from
// structured demo fixture files or from a PostgreSQL database via Prisma.
//
// Rules:
//   - If DEMO_MODE env var is explicitly "true", always use demo data.
//   - If DATABASE_URL is missing, safely fall back to demo data.
//   - If DATABASE_URL exists and DEMO_MODE is not "true", use Prisma.
//   - Never attempt Prisma calls when DATABASE_URL is unavailable.
// ============================================================

export const DEMO_MODE = process.env.DEMO_MODE === "true";

/**
 * Check whether Cloudinary credentials are configured.
 * When false, media operations use local demo assets.
 */
export const CLOUDINARY_CONFIGURED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;
