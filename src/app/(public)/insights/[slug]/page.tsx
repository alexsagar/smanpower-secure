import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema } from "@/lib/seo/schema";
import { sanitizeHtml } from "@/lib/html-safety";
import { prisma } from "@/lib/prisma";
import { resolveImageMediaUrl } from "@/lib/media-resolver";
import { toPublicHref } from "@/lib/public-href";
import { ArrowLeft, ArrowUpRight, Clock, User, ShieldCheck, Newspaper, BookOpen, Calendar, Tag } from "lucide-react";

export const revalidate = 60;

async function getInsight(slug: string) {
  return prisma.insightArticle.findFirst({
    where: { slug, lang: "en", status: "PUBLISHED", deletedAt: null },
    include: { featuredImage: true, category: true, author: true },
  });
}

function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsight(slug);
  if (!insight) return buildPageMetadata({ title: "Not Found", path: "" });

  const base = buildPageMetadata({
    title: insight.metaTitle || `${insight.title} | Seven Seas Chronicle`,
    description: insight.metaDescription || insight.summary || undefined,
    path: `/insights/${slug}`,
    canonicalOverride: insight.canonicalUrl || undefined,
    ogImage: insight.ogImage || (insight.featuredImage ? resolveImageMediaUrl(insight.featuredImage as any, { width: 1200 }) : undefined),
    noIndex: insight.noIndex || false,
  });

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

  const relatedInsights = await prisma.insightArticle.findMany({
    where: { status: "PUBLISHED", deletedAt: null, lang: "en", NOT: { slug } },
    include: { featuredImage: true, category: true, author: true },
    orderBy: { publishDate: "desc" },
    take: 3,
  });

  const publishedLabel = insight.publishDate
    ? new Date(insight.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const minutes = readingMinutes(insight.content);

  const articleSchema = buildArticleSchema({
    title: insight.title,
    slug: insight.slug,
    summary: insight.summary,
    metaDescription: insight.metaDescription,
    imageUrl: insight.ogImage || (insight.featuredImage ? resolveImageMediaUrl(insight.featuredImage as any, { width: 1200 }) : null),
    authorName: insight.author?.name,
    publishDate: insight.publishDate,
    updatedAt: insight.updatedAt,
  });

  const isFilename = (str?: string) => !str || /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(str.trim());
  const caption = insight.featuredImage?.caption && !isFilename(insight.featuredImage.caption)
    ? insight.featuredImage.caption
    : (insight.featuredImage?.altText && !isFilename(insight.featuredImage.altText) ? insight.featuredImage.altText : undefined);

  return (
    <>
      {articleSchema && (
        <Script id={`insight-schema-${insight.id}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(articleSchema)}
        </Script>
      )}

      <article className="bg-brand-off-white pb-24 pt-[calc(var(--site-header-height)+2rem)]">
        {/* Top Editorial Navigation Bar */}
        <div className="container-wide mx-auto px-6 lg:px-12 max-w-6xl mb-8">
          <div className="border-t-2 border-b border-brand-black/20 py-3 flex items-center justify-between">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-black hover:text-brand-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Insights Index
            </Link>
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-brand-muted">
              <Newspaper className="w-3.5 h-3.5 text-brand-gold" />
              <span>Editorial Intelligence Report</span>
            </div>
          </div>
        </div>

        <div className="container-wide mx-auto px-6 lg:px-12 max-w-6xl">
          {/* Headline & Deck Header */}
          <header className="max-w-4xl mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-6 border border-brand-gold/30">
              <Tag className="w-3 h-3" />
              <span>{insight.category?.name || "Industry Insight"}</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.06] text-brand-black tracking-tight mb-6">
              {insight.title}
            </h1>

            {insight.summary && (
              <p className="font-sans text-lg md:text-xl text-brand-charcoal/80 leading-relaxed max-w-3xl border-l-4 border-brand-gold pl-5 italic bg-brand-white/80 py-3">
                {insight.summary}
              </p>
            )}
          </header>

          {/* Editorial Byline Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold uppercase tracking-widest text-brand-charcoal/70 mb-12 border-y border-brand-black/15 py-4 bg-brand-white/40">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-brand-black font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-gold" />
                {insight.author?.name || "Editorial Team"}
              </span>
              {publishedLabel && (
                <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-4">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  <time dateTime={insight.publishDate?.toISOString()}>{publishedLabel}</time>
                </span>
              )}
              <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-4">
                <Clock className="w-3.5 h-3.5 text-brand-gold" />
                {minutes} min read
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Report</span>
            </div>
          </div>

          {/* Main Grid: Sidebar Factsheet + Article Body */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
            {/* Sidebar Factsheet */}
            <aside className="lg:sticky lg:top-[calc(var(--site-header-height)+2rem)] lg:self-start space-y-8">
              {insight.featuredImage && (
                <figure className="bg-brand-white border-2 border-brand-black p-3 shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-brand-charcoal">
                    <Image
                      src={resolveImageMediaUrl(insight.featuredImage as any, { width: 800 })}
                      alt={isFilename(insight.featuredImage.altText) ? insight.title : (insight.featuredImage.altText || insight.title)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 340px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {caption && (
                    <figcaption className="mt-3 text-xs text-brand-charcoal/80 leading-relaxed font-serif italic border-t border-brand-black/10 pt-2 text-center">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Factsheet Box */}
              <div className="bg-brand-white border border-brand-black/20 p-6 shadow-sm font-sans">
                <h3 className="font-serif text-lg font-bold text-brand-black uppercase tracking-wider border-b-2 border-brand-black pb-2 mb-4 flex items-center justify-between">
                  <span>At a Glance</span>
                  <span className="text-[10px] font-mono font-normal text-brand-muted">ARTICLE BRIEF</span>
                </h3>

                <dl className="space-y-4 text-xs">
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Category</dt>
                    <dd className="font-semibold text-brand-black mt-0.5">
                      {insight.category?.name || "General Insight"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Author / Source</dt>
                    <dd className="font-semibold text-brand-black mt-0.5">
                      {insight.author?.name || "Seven Seas Editorial"}
                    </dd>
                  </div>

                  {publishedLabel && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Published Date</dt>
                      <dd className="text-brand-charcoal mt-0.5">{publishedLabel}</dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Reading Time</dt>
                    <dd className="text-brand-charcoal mt-0.5">{minutes} minutes</dd>
                  </div>

                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Language</dt>
                    <dd className="text-brand-charcoal mt-0.5 uppercase">{insight.lang || "en"}</dd>
                  </div>
                </dl>
              </div>
            </aside>

            {/* Article Main Body */}
            <main className="bg-brand-white border border-brand-black/15 p-8 md:p-12 shadow-sm">
              {/* Editorial Drop-Cap Body */}
              <div
                className="prose prose-lg max-w-none 
                  font-sans text-brand-black/85 leading-relaxed
                  prose-p:text-brand-black/85 prose-p:leading-relaxed prose-p:mb-6
                  prose-p:first-of-type:first-letter:text-6xl 
                  prose-p:first-of-type:first-letter:font-serif 
                  prose-p:first-of-type:first-letter:float-left 
                  prose-p:first-of-type:first-letter:mr-3 
                  prose-p:first-of-type:first-letter:leading-none 
                  prose-p:first-of-type:first-letter:text-brand-black
                  prose-headings:font-serif prose-headings:font-normal prose-headings:text-brand-black
                  prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:border-b prose-h2:border-brand-black/15 prose-h2:pb-3 prose-h2:mt-10
                  prose-strong:text-brand-black prose-strong:font-bold
                  prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:border-brand-gold prose-blockquote:text-brand-black/90
                  prose-img:rounded-none prose-img:border prose-img:border-brand-black/20 prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(insight.content) }}
              />
            </main>
          </div>

          {/* Related Insights Section */}
          {relatedInsights.length > 0 && (
            <section className="mt-24 pt-12 border-t-2 border-brand-black">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl md:text-3xl font-normal text-brand-black">
                  More Intelligence Reports in this Edition
                </h3>
                <Link
                  href="/insights"
                  className="text-xs uppercase tracking-widest font-bold text-brand-black hover:text-brand-gold transition-colors flex items-center gap-1"
                >
                  View Full Index
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedInsights.map((relItem) => (
                  <article key={relItem.id} className="bg-brand-white border border-brand-black/15 p-6 hover:shadow-lg transition-all group">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block mb-2">
                      {relItem.category?.name || "Report"}
                    </span>
                    <Link href={toPublicHref(`/insights/${relItem.slug}`)}>
                      <h4 className="font-serif text-xl font-normal text-brand-black group-hover:text-brand-gold transition-colors mb-3 line-clamp-2">
                        {relItem.title}
                      </h4>
                    </Link>
                    {relItem.summary && (
                      <p className="text-xs text-brand-muted line-clamp-2 mb-4 font-sans">
                        {relItem.summary}
                      </p>
                    )}
                    <Link
                      href={toPublicHref(`/insights/${relItem.slug}`)}
                      className="text-[11px] uppercase tracking-widest font-bold text-brand-black flex items-center gap-1"
                    >
                      Read Feature <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}

