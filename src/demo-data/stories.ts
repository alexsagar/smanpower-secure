// ============================================================
// Demo Success Stories
// ============================================================

import type { CmsSuccessStory } from "@/types/content";
import { demoMedia } from "./media";

export const demoStories: CmsSuccessStory[] = [
  {
    id: "story-1",
    slug: "candidate-journey-1",
    title: "Candidate Journey",
    summary: "Heavy Equipment Operator — Doha, Qatar",
    content:
      "Seven Seas didn't just find me a job; they trained me. The trade test centre prepared me for the exact machinery I use today in Doha. Best of all, I didn't pay a single rupee in recruitment fees.",
    storyType: "CANDIDATE",
    featuredImage: demoMedia.heroTraining,
    personName: "Rajendra Thapa",
    showPersonName: true,
    country: "Qatar",
    industry: "Construction & Technical Trades",
    isPublished: true,
    isFeatured: true,
    metaTitle: "Rajendra Thapa — Candidate Journey | Seven Seas Intercontinental",
    metaDescription: "How ethical recruitment and trade testing helped Rajendra Thapa build a career as a heavy equipment operator in Doha, Qatar.",
    createdAt: "2026-07-02T00:00:00Z",
  },
  {
    id: "story-2",
    slug: "employer-partnership-1",
    title: "Employer Partnership",
    summary: "Fleet Expansion Project — Dubai, UAE",
    content:
      "We needed 150 certified drivers within a month. Seven Seas mobilized their network, conducted rigorous driving tests at their facility, and delivered a fully compliant workforce ahead of schedule.",
    storyType: "EMPLOYER",
    featuredImage: demoMedia.tradeTestCentre,
    personName: "Al-Safwa Logistics",
    showPersonName: true,
    country: "UAE",
    industry: "Logistics & Transport",
    isPublished: true,
    isFeatured: true,
    metaTitle: "Al-Safwa Logistics — Employer Partnership | Seven Seas",
    metaDescription: "How Seven Seas delivered 150 certified drivers for Al-Safwa Logistics fleet expansion in Dubai, UAE.",
    createdAt: "2026-07-03T00:00:00Z",
  },
  {
    id: "story-3",
    slug: "candidate-journey-2",
    title: "Candidate Journey",
    summary: "Hospitality Supervisor — Kuwait City",
    content:
      "The pre-departure orientation gave me the confidence I needed. I understood the culture, my legal rights, and exactly what to expect before I even boarded the plane. Now, I lead a team of 12.",
    storyType: "CANDIDATE",
    featuredImage: demoMedia.corporateOffice,
    personName: "Sunita Rai",
    showPersonName: true,
    country: "Kuwait",
    industry: "Hospitality & Hotels",
    isPublished: true,
    isFeatured: true,
    metaTitle: "Sunita Rai — Candidate Journey | Seven Seas Intercontinental",
    metaDescription: "Sunita Rai's journey from pre-departure orientation to hospitality supervisor in Kuwait City.",
    createdAt: "2026-07-04T00:00:00Z",
  },
];
