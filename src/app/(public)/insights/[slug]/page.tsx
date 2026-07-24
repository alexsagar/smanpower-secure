import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema } from "@/lib/seo/schema";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { sanitizeHtml } from "@/lib/html-safety";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

async function getInsight(slug: string) {
  return prisma.insightArticle.findFirst({
    where: { slug, lang: "en", status: "PUBLISHED", deletedAt: null },
    include: { featuredImage: true, category: true, author: true },
  });
}

/** Rough reading time from the plain-text length of the (HTML) body. */
function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsight(slug);
  if (!insight) return buildPageMetadata({ title: "Not Found", path: "" });

  const base = buildPageMetadata({
    title: insight.metaTitle || insight.title,
    description: insight.metaDescription || insight.summary || undefined,
    path: `/insights/${slug}`,
    canonicalOverride: insight.canonicalUrl || undefined,
    ogImage: insight.ogImage || insight.featuredImage?.fileUrl || undefined,
    noIndex: insight.noIndex || false,
  });

  // Promote the Open Graph object from a generic "website" to a rich "article".
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: insight.publishDate?.toISOString(),
      modifiedTime: insight.updatedAt?.toISOString(),
      authors: [insight.author?.name || "Seven Seas Intercontinental"],
      section: insight.category?.name || undefined,
    },
  };
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = await getInsight(slug);
  if (!insight) notFound();

  const publishedLabel = insight.publishDate
    ? new Date(insight.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const minutes = readingMinutes(insight.content);

  const articleSchema = buildArticleSchema({
    title: insight.title,
    slug: insight.slug,
    summary: insight.summary,
    metaDescription: insight.metaDescription,
    imageUrl: insight.ogImage || insight.featuredImage?.fileUrl || null,
    authorName: insight.author?.name,
    publishDate: insight.publishDate,
    updatedAt: insight.updatedAt,
  });

  return (
    <>
      {articleSchema && (
        <Script id={`insight-schema-${insight.id}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(articleSchema)}
        </Script>
      )}

      <HeroInternal
        title={insight.title}
        subtitle={insight.category?.name || "Insight"}
        imageSrc={insight.featuredImage?.fileUrl || "/images/hero_training_orientation_1782920391505.png"}
      />

      <article className="py-20 md:py-28 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12 max-w-3xl">
          {/* Byline */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-brand-muted mb-10 border-b border-brand-charcoal/10 pb-6">
            <span>{insight.author?.name || "Editorial Team"}</span>
            {publishedLabel && (
              <>
                <span className="w-1 h-1 bg-brand-gold rounded-full" />
                <time dateTime={insight.publishDate?.toISOString()}>{publishedLabel}</time>
              </>
            )}
            <span className="w-1 h-1 bg-brand-gold rounded-full" />
            <span>{minutes} min read</span>
          </div>

          {/* Lead / summary */}
          {insight.summary && (
            <p className="text-xl md:text-2xl leading-relaxed text-brand-black font-light mb-12">
              {insight.summary}
            </p>
          )}

          {/* Body — Tailwind Typography renders headings, lists, quotes, images. */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-brand-black prose-p:text-brand-black/80 prose-li:text-brand-black/80 prose-a:text-brand-gold-dark hover:prose-a:text-brand-charcoal prose-strong:text-brand-black prose-blockquote:border-brand-gold prose-blockquote:text-brand-charcoal prose-img:rounded-sm prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(insight.content) }}
          />
        </div>
      </article>
    </>
  );
}
