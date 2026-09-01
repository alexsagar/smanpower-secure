import "server-only";
import type { CmsContentBlock } from "@/types/content";
import { getFeaturedStories, getPublishedStories } from "@/repositories/content-resolver";
import { resolveMediaUrl, isFilenameLike } from "@/lib/media-resolver";
import { StoryGridBlock, type StoryCard } from "./StoryGridBlock";

/**
 * Server wrapper for the homepage story_grid block: renders real success
 * stories from the Stories section of the backend (featured first, newest
 * published otherwise). Falls back to the block's demo stories when nothing
 * is published yet.
 */
export async function StoryGridBlockServer({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const featured = await getFeaturedStories();
  const source = featured.length > 0 ? featured : await getPublishedStories();

  const stories: StoryCard[] = source.slice(0, 2).map((s) => ({
    type: s.storyType === "EMPLOYER" ? "employer" : "candidate",
    country: s.country || "",
    title: s.title,
    desc: s.summary || "",
    // StoryGridBlock renders this through next/image, which must receive a
    // bare source (its optimiser does the sizing). An R2 asset's cdn-cgi URL
    // cannot be fetched as an OpenNext Worker subrequest and 404s, so resolve
    // to the plain provider URL here, not a preset transform.
    imageSrc: s.featuredImage ? resolveMediaUrl(s.featuredImage) : undefined,
    imageAlt: isFilenameLike(s.featuredImage?.altText) ? s.title : s.featuredImage!.altText,
    slug: s.slug,
  }));

  return <StoryGridBlock block={block} lang={lang} stories={stories} />;
}
