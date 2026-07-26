"use client";

import React from "react";
import { type MediaLike } from "@/lib/media-resolver";
import { EditorialMagazineGrid, type MagazineItem } from "./EditorialMagazineGrid";

export interface InsightArticleItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  publishDate?: Date | null;
  isFeatured?: boolean;
  category?: { name: string } | null;
  author?: { name: string } | null;
  featuredImage?: MediaLike | null;
}

interface InsightMagazineGridProps {
  articles: InsightArticleItem[];
  emptyStateHeading?: string;
  emptyStateBody?: string;
  readMoreLabel?: string;
}

/** Insights index: flattens articles onto the shared broadsheet layout. */
export function InsightMagazineGrid({
  articles,
  emptyStateHeading = "No published insights available",
  emptyStateBody = "Check back soon for latest industry reports, compliance updates, and recruitment guides.",
  readMoreLabel = "Read Feature Article",
}: InsightMagazineGridProps) {
  const items: MagazineItem[] = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: article.content,
    publishDate: article.publishDate,
    authorName: article.author?.name,
    facet: article.category?.name,
    image: article.featuredImage,
  }));

  return (
    <EditorialMagazineGrid
      items={items}
      basePath="/insights"
      labels={{
        issueLabel: "Global Workforce",
        countVerb: "Published",
        countNoun: ["Report", "Reports"],
        allTabLabel: "All Reports",
        leadBadge: "Cover Story Analysis",
        facetFallback: "Key Report",
        authorFallback: "Editorial Board",
        cardAuthorFallback: "Editorial Team",
        briefingHeading: "02 • Field Scope & Classification",
        classificationLabel: "Classification",
        classificationFallback: "General Intelligence",
        sourceLabel: "Source",
        documentHeading: "03 • Full Report Document",
        remainingHeading: "Additional Reports & Dossiers in this Edition",
        remainingNoun: ["Article", "Articles"],
        cardLinkLabel: "Read Report",
        cardFacetFallback: "Report",
        emptyStateHeading,
        emptyStateBody,
        readMoreLabel,
      }}
    />
  );
}
