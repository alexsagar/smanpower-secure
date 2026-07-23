/**
 * Controlled list of footer social platforms. Icons are mapped by platform
 * name in SocialBrandIcon, so only these values render a brand glyph — keeping
 * this an explicit tuple blocks arbitrary platform strings (and arbitrary icon
 * markup). Lives outside the "use server" actions file, which may only export
 * async functions.
 */
export const FOOTER_SOCIAL_PLATFORMS = [
  "linkedin",
  "facebook",
  "instagram",
  "x",
  "twitter",
  "youtube",
  "tiktok",
] as const;
