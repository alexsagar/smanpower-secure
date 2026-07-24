import "server-only";
import type { CmsContentBlock } from "@/types/content";
import { getPublishedInsights } from "@/repositories/content-resolver";
import { InsightPreviewBlock, type InsightCard } from "./InsightPreviewBlock";

/**
 * Server wrapper for the homepage insight_preview block: fetches the latest
 * published insights and hands them to the presentational block. Falls back to
 * the block's demo articles when nothing is published yet.
 */
export async function InsightPreviewBlockServer({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const published = await getPublishedInsights();
  const articles: InsightCard[] = published.slice(0, 3).map((i: any) => ({
    category: i.category,
    date: i.publishDate ? new Date(i.publishDate).toLocaleDateString() : "",
    title: i.title,
    slug: i.slug,
  }));
  return <InsightPreviewBlock block={block} lang={lang} articles={articles} />;
}
