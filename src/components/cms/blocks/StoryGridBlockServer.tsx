import "server-only";
import type { CmsContentBlock } from "@/types/content";
import { getFeaturedStories, getPublishedStories } from "@/repositories/content-resolver";
import { resolvePresetMediaUrl, isFilenameLike } from "@/lib/media-resolver";
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
    // Rendered by StoryGridBlock into a fill/object-cover card, so the card
    // does the cropping — see the `fill` note on resolvePresetMediaUrl.
    imageSrc: resolvePresetMediaUrl(s.featuredImage, "successStoryCard", { fill: true }),
    imageAlt: isFilenameLike(s.featuredImage?.altText) ? s.title : s.featuredImage!.altText,
    slug: s.slug,
  }));

  return <StoryGridBlock block={block} lang={lang} stories={stories} />;
}
