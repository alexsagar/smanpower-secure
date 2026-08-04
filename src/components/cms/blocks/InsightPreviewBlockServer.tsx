import "server-only";
import type { CmsContentBlock } from "@/types/content";
import { getPublishedInsights } from "@/repositories/content-resolver";
import { isFilenameLike } from "@/lib/media-resolver";
import { InsightPreviewBlock, type InsightCard } from "./InsightPreviewBlock";

/**
 * Server wrapper for the homepage insight_preview block: fetches the latest
 * published insights and hands them to the presentational block. Falls back to
 * the block's demo articles when nothing is published yet.
 */
export async function InsightPreviewBlockServer({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const published = await getPublishedInsights();
  const articles: InsightCard[] = published.slice(0, 3).map((i: any) => ({
    category: i.category || "Uncategorized",
    date: i.publishDate ? new Date(i.publishDate).toLocaleDateString() : "",
    title: i.title,
    slug: i.slug,
    image: i.featuredImage,
    imageAlt: isFilenameLike(i.featuredImage?.altText) ? i.title : i.featuredImage?.altText,
  }));
  return <InsightPreviewBlock block={block} lang={lang} articles={articles} />;
}
