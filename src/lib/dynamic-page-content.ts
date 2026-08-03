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
      ...(asString(item.fileUrl) ? { fileUrl: asString(item.fileUrl) } : {}),
    }))
    .filter((item) => item.title || item.image || item.fileUrl);
}

function asProcess(value: unknown): PageContent["process"] {
  return asArray<Record<string, unknown>>(value)
    ?.map((item) => ({
      title: asString(item.title) ?? "",
      desc: asString(item.desc) ?? "",
    }))
    .filter((item) => item.title || item.desc);
}

function asFaqs(value: unknown): PageContent["faqs"] {
  return asArray<Record<string, unknown>>(value)
    ?.map((item) => ({
      q: asString(item.q) ?? "",
      a: asString(item.a) ?? "",
    }))
    .filter((item) => item.q || item.a);
}

function asCta(value: unknown, fallback?: PageContent["cta"]): PageContent["cta"] {
  if (!value || typeof value !== "object") return fallback;
  const item = value as Record<string, unknown>;
  const heading = asString(item.heading);
  const body = asString(item.body);
  if (!heading && !body) return fallback;
  return {
    heading: heading ?? fallback?.heading ?? "",
    body: body ?? fallback?.body ?? "",
    buttonLabel: asString(item.buttonLabel) ?? fallback?.buttonLabel,
    buttonHref: asString(item.buttonHref) ?? fallback?.buttonHref,
  };
}

/**
 * Builds the CMS block content for a dynamic page from a PageContent record.
 * Shared with the migration script so the stored shape and the shape read back
 * by `mapBlockContentToPageContent` can never drift apart.
 */
const TEMPLATE_LABEL_DEFAULTS = {
  overviewSubtitle: "Overview",
  featuresEyebrow: "Key Highlights",
  featuresHeading: "The Seven Seas Standard.",
  documentsEyebrow: "Official Records",
  documentsHeading: "Licenses & Certifications.",
  documentsCtaLabel: "View Document",
} as const;

export function buildDynamicPageBlockContent(entry: PageContent) {
  return {
    ...TEMPLATE_LABEL_DEFAULTS,
    // Preserve the entry's own template labels; only fall back to the defaults
    // when a field is absent. Previously these were always overwritten with the
    // defaults, so migrating a page with custom labels (e.g. "The Standard
    // Explained") silently reverted them to "Overview" — a content regression
    // the round-trip guard test catches.
    overviewSubtitle: entry.overviewSubtitle ?? TEMPLATE_LABEL_DEFAULTS.overviewSubtitle,
    featuresEyebrow: entry.featuresEyebrow ?? TEMPLATE_LABEL_DEFAULTS.featuresEyebrow,
    featuresHeading: entry.featuresHeading ?? TEMPLATE_LABEL_DEFAULTS.featuresHeading,
    documentsEyebrow: entry.documentsEyebrow ?? TEMPLATE_LABEL_DEFAULTS.documentsEyebrow,
    documentsHeading: entry.documentsHeading ?? TEMPLATE_LABEL_DEFAULTS.documentsHeading,
    documentsCtaLabel: entry.documentsCtaLabel ?? TEMPLATE_LABEL_DEFAULTS.documentsCtaLabel,
    title: entry.title,
    subtitle: entry.subtitle,
    heroImage: entry.heroImage,
    missionHeading: entry.missionHeading ?? "",
    paragraphs: entry.missionText ?? [],
    features: entry.features ?? [],
    documents: entry.documents ?? [],
    process: entry.process ?? [],
    processEyebrow: entry.processEyebrow ?? "",
    processHeading: entry.processHeading ?? "",
    faqs: entry.faqs ?? [],
    faqsEyebrow: entry.faqsEyebrow ?? "",
    faqsHeading: entry.faqsHeading ?? "",
    cta: entry.cta ?? null,
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
  const process = asProcess(content.process) ?? fallback?.process;
  const faqs = asFaqs(content.faqs) ?? fallback?.faqs;
  const cta = asCta(content.cta, fallback?.cta);

  return {
    slug,
    overviewSubtitle: asString(content.overviewSubtitle) ?? fallback?.overviewSubtitle,
    featuresEyebrow: asString(content.featuresEyebrow) ?? fallback?.featuresEyebrow,
    featuresHeading: asString(content.featuresHeading) ?? fallback?.featuresHeading,
    documentsEyebrow: asString(content.documentsEyebrow) ?? fallback?.documentsEyebrow,
    documentsHeading: asString(content.documentsHeading) ?? fallback?.documentsHeading,
    documentsCtaLabel: asString(content.documentsCtaLabel) ?? fallback?.documentsCtaLabel,
    processEyebrow: asString(content.processEyebrow) ?? fallback?.processEyebrow,
    processHeading: asString(content.processHeading) ?? fallback?.processHeading,
    faqsEyebrow: asString(content.faqsEyebrow) ?? fallback?.faqsEyebrow,
    faqsHeading: asString(content.faqsHeading) ?? fallback?.faqsHeading,
    title: asString(content.title) ?? fallback?.title ?? "",
    subtitle: asString(content.subtitle) ?? fallback?.subtitle ?? "",
    heroImage: asString(content.heroImage) ?? fallback?.heroImage ?? "",
    missionHeading: asString(content.missionHeading) ?? fallback?.missionHeading,
    ...(missionText ? { missionText } : {}),
    ...(features ? { features } : {}),
    ...(documents ? { documents } : {}),
    ...(process ? { process } : {}),
    ...(faqs ? { faqs } : {}),
    ...(cta ? { cta } : {}),
  };
}
