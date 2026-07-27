import React from "react";
import type { CmsContentBlock } from "@/types/content";
import { GalleryInteractiveView } from "./GalleryInteractiveView";
import type { GalleryItem } from "./GalleryLightbox";

const defaultFallbackItems: GalleryItem[] = [
  {
    imageUrl: "/images/trade_test_centre_1782920400836.png",
    title: "Heavy Mechanical & Welding Trade Testing Lab",
    caption: "Practical skill validation under ISO-certified protocols at our primary Kathmandu technical center.",
    category: "Trade Test Labs",
    location: "Kathmandu Central Hub",
    date: "2026-06-15"
  },
  {
    imageUrl: "/images/hero_training_orientation_1782920391505.png",
    title: "Pre-Deployment Orientation Auditorium",
    caption: "Mandatory cultural adaptation, occupational health & safety, and labor rights training session.",
    category: "Orientation & Welfare",
    location: "Kathmandu Auditorium",
    date: "2026-07-02"
  },
  {
    imageUrl: "/images/corporate_office_interview_1782920412325.png",
    title: "Corporate Interview & Client Delegate Hub",
    caption: "Private interview suites equipped for international employer live screening and technical testing.",
    category: "Corporate Hub",
    location: "Lalitpur HQ",
    date: "2026-05-20"
  },
  {
    imageUrl: "/images/nepal_provinces_map.png",
    title: "Nationwide Ethical Sourcing Coverage",
    caption: "Direct community sourcing footprint spanning all 7 provinces of Nepal, enforcing 100% employer-pays principles.",
    category: "Sourcing & Intelligence",
    location: "Nepal Provinces 1-7",
    date: "2026-04-10"
  },
  {
    imageUrl: "/images/rba.png",
    title: "RBA Ethical Recruitment Compliance Standard",
    caption: "Operational audit benchmark guaranteeing fair treatment, zero worker fee, and anti-debt-bondage practices.",
    category: "Certifications & Standards",
    location: "RBA Gold Standard",
    date: "2026-01-15"
  },
  {
    imageUrl: "/images/iso.png",
    title: "ISO 9001:2015 Certified Quality Systems",
    caption: "Systematic screening and documentation audit standards for international workforce deployment.",
    category: "Certifications & Standards",
    location: "ISO Certified",
    date: "2026-02-01"
  }
];

export function ImageGalleryBlock({ block }: { block: CmsContentBlock }) {
  const content = (block.content || {}) as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    items?: GalleryItem[];
  };

  const rawItems = (content.items || []).filter((item) => item.imageUrl?.trim());
  const items = rawItems.length > 0 ? rawItems : defaultFallbackItems;

  return (
    <GalleryInteractiveView
      eyebrow={content.eyebrow}
      title={content.title}
      subtitle={content.subtitle}
      items={items}
    />
  );
}
