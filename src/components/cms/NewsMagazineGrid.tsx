"use client";

import React from "react";
import { type MediaLike } from "@/lib/media-resolver";
import { EditorialMagazineGrid, type MagazineItem } from "./EditorialMagazineGrid";

export interface NewsArticleItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  publishDate?: Date | null;
  newsType?: string | null;
  author?: { name: string } | null;
  featuredMedia?: MediaLike | null;
  /** Legacy string URL, kept for rows that predate the media library. */
  featuredImage?: string | null;
}

interface NewsMagazineGridProps {
  articles: NewsArticleItem[];
  emptyStateHeading?: string;
  emptyStateBody?: string;
  readMoreLabel?: string;
}

/** Newsroom index: flattens dispatches onto the shared broadsheet layout. */
export function NewsMagazineGrid({
  articles,
  emptyStateHeading = "No official notices in this edition",
  emptyStateBody = "Check back soon for the latest company dispatches and press announcements.",
  readMoreLabel = "Read Full Press Release",
}: NewsMagazineGridProps) {
  const items: MagazineItem[] = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: article.content,
    publishDate: article.publishDate,
    authorName: article.author?.name,
    facet: article.newsType,
    // Media-library asset first, then the legacy string URL.
    image: article.featuredMedia ?? article.featuredImage,
  }));

  return (
    <EditorialMagazineGrid
      items={items}
      basePath="/news"
      imageFallback="/images/trade_test_centre_1782920400836.png"
      labels={{
        issueLabel: "Seven Seas Newsroom • Press Dispatches & Notices",
        countVerb: "Official",
        countNoun: ["Notice", "Notices"],
        allTabLabel: "All Dispatches",
        leadBadge: "Official Press Release",
        facetFallback: "Official Notice",
        authorFallback: "Corporate Communications",
        cardAuthorFallback: "Corporate Press",
        briefingHeading: "02 • Classification & Issuer",
        classificationLabel: "Category",
        classificationFallback: "Official Notice",
        sourceLabel: "Issuing Body",
        sourceValue: "Seven Seas Intercontinental Press Desk",
        documentHeading: "03 • Full Dispatch",
        remainingHeading: "Additional Dispatches & Announcements",
        remainingNoun: ["Notice", "Notices"],
        cardLinkLabel: "Read Notice",
        cardFacetFallback: "Notice",
        emptyStateHeading,
        emptyStateBody,
        readMoreLabel,
      }}
    />
  );
}
