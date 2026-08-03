// ============================================================
// Demo Media Assets — Local placeholder images
// ============================================================

import type { CmsMediaAsset } from "@/types/content";

export const demoMedia: Record<string, CmsMediaAsset> = {
  heroTraining: {
    id: "media-hero-training",
    source: "LOCAL_DEMO",
    localPath: "/images/hero_training_orientation_1782920391505.png",
    resourceType: "image",
    fileName: "hero_training_orientation.png",
    altText: "Candidate orientation and training session at Seven Seas facility",
    caption: "Pre-departure training orientation",
    mediaStatus: "AI_PLACEHOLDER",
    visibility: "PUBLIC",
    width: 1920,
    height: 1080,
    folder: "hero",
    tags: ["hero", "training", "orientation"],
    createdAt: "2026-07-01T00:00:00Z",
  },
  tradeTestCentre: {
    id: "media-trade-test",
    source: "LOCAL_DEMO",
    localPath: "/images/trade_test_centre_1782920400836.png",
    resourceType: "image",
    fileName: "trade_test_centre.png",
    altText: "Trade test centre facility with practical assessment stations",
    caption: "Technical trade testing centre",
    mediaStatus: "AI_PLACEHOLDER",
    visibility: "PUBLIC",
    width: 1920,
    height: 1080,
    folder: "facilities",
    tags: ["facility", "trade-test", "assessment"],
    createdAt: "2026-07-01T00:00:00Z",
  },
  corporateOffice: {
    id: "media-corporate-office",
    source: "LOCAL_DEMO",
    localPath: "/images/corporate_office_interview_1782920412325.png",
    resourceType: "image",
    fileName: "corporate_office_interview.png",
    altText: "Corporate office interview and screening process",
    caption: "Corporate operations and interview area",
    mediaStatus: "AI_PLACEHOLDER",
    visibility: "PUBLIC",
    width: 1920,
    height: 1080,
    folder: "site",
    tags: ["office", "interview", "corporate"],
    createdAt: "2026-07-01T00:00:00Z",
  },
  logo: {
    id: "media-logo",
    source: "LOCAL_DEMO",
    localPath: "/images/SSIS.webp",
    resourceType: "image",
    fileName: "SSIS.webp",
    altText: "Seven Seas Intercontinental logo",
    mediaStatus: "REAL_APPROVED",
    visibility: "PUBLIC",
    width: 360,
    height: 287,
    folder: "site",
    tags: ["logo", "brand"],
    createdAt: "2026-06-01T00:00:00Z",
  },
  logoFull: {
    id: "media-logo-full",
    source: "LOCAL_DEMO",
    localPath: "/images/SEVENSEAS logo 1.png",
    resourceType: "image",
    fileName: "SEVENSEAS_logo_1.png",
    altText: "Seven Seas Intercontinental full logo",
    mediaStatus: "REAL_APPROVED",
    visibility: "PUBLIC",
    width: 800,
    height: 200,
    folder: "site",
    tags: ["logo", "brand", "full"],
    createdAt: "2026-06-01T00:00:00Z",
  },
  nepalMap: {
    id: "media-nepal-map",
    source: "LOCAL_DEMO",
    localPath: "/images/nepal_provinces_map.png",
    resourceType: "image",
    fileName: "nepal_provinces_map.png",
    altText: "Map of Nepal provinces showing workforce distribution",
    mediaStatus: "AI_PLACEHOLDER",
    visibility: "PUBLIC",
    width: 1200,
    height: 800,
    folder: "site",
    tags: ["nepal", "map", "intelligence"],
    createdAt: "2026-07-01T00:00:00Z",
  },
};

/** Get all demo media assets as an array */
export function getAllDemoMedia(): CmsMediaAsset[] {
  return Object.values(demoMedia);
}

/** Find a demo media asset by ID */
export function getDemoMediaById(id: string): CmsMediaAsset | undefined {
  return Object.values(demoMedia).find((m) => m.id === id);
}
