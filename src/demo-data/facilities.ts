// ============================================================
// Demo Training Facilities
// ============================================================

import type { CmsTrainingFacility } from "@/types/content";
import { demoMedia } from "./media";

export const demoFacilities: CmsTrainingFacility[] = [
  {
    id: "fac-1",
    name: "Our Training Centres",
    slug: "training-centres",
    description: "State of the art preparation",
    isActive: true,
    images: [demoMedia.heroTraining],
  },
  {
    id: "fac-2",
    name: "Trade Test Centre",
    slug: "trade-test-centre",
    description: "Validating excellence",
    isActive: true,
    images: [demoMedia.tradeTestCentre],
  },
  {
    id: "fac-3",
    name: "Candidate Orientation",
    slug: "orientation",
    description: "Beyond the technical",
    isActive: true,
    images: [demoMedia.heroTraining],
  },
  {
    id: "fac-4",
    name: "Language Preparation",
    slug: "language",
    description: "Breaking barriers",
    isActive: true,
  },
  {
    id: "fac-5",
    name: "Facility Gallery",
    slug: "facility-gallery",
    description: "See for yourself",
    isActive: true,
  }
];
