// ============================================================
// Demo Insights & News
// ============================================================

import type { CmsInsightArticle } from "@/types/content";
import { demoMedia } from "./media";

export const demoInsights: CmsInsightArticle[] = [
  {
    id: "ins-1",
    title: "Shifts in Gulf Construction Workforce Demand",
    slug: "shifts-in-gulf-construction-workforce-demand",
    category: "Market Update",
    summary: "An analysis of the changing skill requirements in the GCC construction sector for Q3.",
    content: "Full article content goes here...",
    publishDate: "2024-10-15T00:00:00Z",
    isPublished: true,
    isFeatured: true,
    featuredImage: demoMedia.heroTraining,
  },
  {
    id: "ins-2",
    title: "Implementing RBA Standards in Recruitment",
    slug: "implementing-rba-standards-in-recruitment",
    category: "Ethical Guide",
    summary: "A practical guide for employers on maintaining Responsible Business Alliance standards.",
    content: "Full article content goes here...",
    publishDate: "2024-09-20T00:00:00Z",
    isPublished: true,
    isFeatured: true,
    featuredImage: demoMedia.corporateOffice,
  },
  {
    id: "ins-3",
    title: "New Trade Test Centre Opens in Kathmandu",
    slug: "new-trade-test-centre-opens-in-kathmandu",
    category: "Company News",
    summary: "Seven Seas expands its infrastructure with a new state-of-the-art trade testing facility.",
    content: "Full article content goes here...",
    publishDate: "2024-08-10T00:00:00Z",
    isPublished: true,
    isFeatured: true,
    featuredImage: demoMedia.tradeTestCentre,
  }
];
