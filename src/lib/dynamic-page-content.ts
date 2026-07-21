import type { PageContent } from "@/lib/content";

/**
 * Pure mapping between the CMS block content shape and the PageContent shape
 * consumed by DynamicPageTemplate.
 *
 * Kept free of repository imports so migration scripts and tests can use it
 * without pulling in the server-only data layer.
 */

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

/**
 * DynamicPageTemplate distinguishes "absent" from "empty":
 * `missionText ? …` renders an empty list for `[]` but the standard fallback
 * paragraph for `undefined`. Collapsing empty arrays to undefined keeps a page
 * with no paragraphs rendering identically to the hardcoded version.
 */
function asArray<T>(value: unknown): T[] | undefined {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : undefined;
}

function asFeatures(value: unknown): PageContent["features"] {
  return asArray<Record<string, unknown>>(value)
    ?.map((item) => ({
      title: asString(item.title) ?? "",
      desc: asString(item.desc) ?? "",
    }))
    .filter((item) => item.title || item.desc);
}

function asDocuments(value: unknown): PageContent["documents"] {
  return asArray<Record<string, unknown>>(value)
    ?.map((item) => ({
      title: asString(item.title) ?? "",
      image: asString(item.image) ?? "",
    }))
    .filter((item) => item.title || item.image);
}

/**
 * Builds the CMS block content for a dynamic page from a PageContent record.
 * Shared with the migration script so the stored shape and the shape read back
 * by `mapBlockContentToPageContent` can never drift apart.
 */
export function buildDynamicPageBlockContent(entry: PageContent) {
  return {
    title: entry.title,
    subtitle: entry.subtitle,
    heroImage: entry.heroImage,
    missionHeading: entry.missionHeading ?? "",
    paragraphs: entry.missionText ?? [],
    features: entry.features ?? [],
    documents: entry.documents ?? [],
  };
}

/** Maps a CMS block's content onto the PageContent shape the template expects. */
export function mapBlockContentToPageContent(
  slug: string,
  content: Record<string, unknown>,
  fallback?: PageContent
): PageContent {
  const features = asFeatures(content.features) ?? fallback?.features;
  const documents = asDocuments(content.documents) ?? fallback?.documents;
  const missionText = asArray<string>(content.paragraphs) ?? fallback?.missionText;

  return {
    slug,
    title: asString(content.title) ?? fallback?.title ?? "",
    subtitle: asString(content.subtitle) ?? fallback?.subtitle ?? "",
    heroImage: asString(content.heroImage) ?? fallback?.heroImage ?? "",
    missionHeading: asString(content.missionHeading) ?? fallback?.missionHeading,
    ...(missionText ? { missionText } : {}),
    ...(features ? { features } : {}),
    ...(documents ? { documents } : {}),
  };
}
