import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { sanitizeHtml } from "@/lib/html-safety";
import { prisma } from "@/lib/prisma";
import { resolveImageMediaUrl, isFilenameLike } from "@/lib/media-resolver";
import { readingMinutes } from "@/lib/utils";
import { toPublicHref } from "@/lib/public-href";
import { ArrowLeft, ArrowUpRight, Clock, User, Newspaper, Calendar, Tag, Bookmark } from "lucide-react";

export const revalidate = 60;

async function getNews(slug: string) {
  return prisma.newsArticle.findFirst({
    where: { slug, lang: "en", status: "PUBLISHED", isPublished: true, deletedAt: null },
    include: { featuredMedia: true, author: true },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNews(slug);
  if (!article) return buildPageMetadata({ title: "Not Found", path: "" });

  return buildPageMetadata({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.summary || undefined,
    path: `/news/${slug}`,
    ogImage: article.ogImage || (article.featuredMedia ? resolveImageMediaUrl(article.featuredMedia, { width: 1200 }) : article.featuredImage || undefined),
    noIndex: article.noIndex || false,
  });
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNews(slug);
  if (!article) notFound();

  const relatedNews = await prisma.newsArticle.findMany({
    where: { status: "PUBLISHED", isPublished: true, deletedAt: null, lang: "en", NOT: { slug } },
    include: { featuredMedia: true, author: true },
    orderBy: { publishDate: "desc" },
    take: 3,
  });

  const publishedLabel = article.publishDate
    ? new Date(article.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const minutes = readingMinutes(article.content);
  const caption = article.featuredMedia?.caption && !isFilenameLike(article.featuredMedia.caption)
    ? article.featuredMedia.caption
    : (article.featuredMedia?.altText && !isFilenameLike(article.featuredMedia.altText) ? article.featuredMedia.altText : undefined);

  return (
    <article className="bg-brand-off-white pb-24 pt-[calc(var(--site-header-height)+2rem)]">
      {/* Top Navigation Bar */}
      <div className="container-wide mx-auto px-6 lg:px-12 max-w-6xl mb-8">
        <div className="border-t-2 border-b border-brand-black/20 py-3 flex items-center justify-between">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-black hover:text-brand-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Newsroom Index
          </Link>
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-brand-muted">
            <Newspaper className="w-3.5 h-3.5 text-brand-gold" />
            <span>Official Press Notice</span>
          </div>
        </div>
      </div>

      <div className="container-wide mx-auto px-6 lg:px-12 max-w-6xl">
        {/* Left-Aligned Header */}
        <header className="max-w-4xl mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-6 border border-brand-gold/30">
            <Tag className="w-3 h-3" />
            <span>{article.newsType || "Official Notice"}</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.06] text-brand-black tracking-tight mb-6">
            {article.title}
          </h1>

          {article.summary && (
            <p className="font-sans text-lg md:text-xl text-brand-charcoal/80 leading-relaxed border-l-4 border-brand-gold pl-5 italic bg-brand-white/80 py-3">
              {article.summary}
            </p>
          )}
        </header>

        {/* Left-Aligned Byline Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold uppercase tracking-widest text-brand-charcoal/70 mb-12 border-y border-brand-black/15 py-4 bg-brand-white/40">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-brand-black font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-gold" />
              {article.author?.name || "Corporate Press Desk"}
            </span>
            {publishedLabel && (
              <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-4">
                <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                <time dateTime={article.publishDate?.toISOString()}>{publishedLabel}</time>
              </span>
            )}
            <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-4">
              <Clock className="w-3.5 h-3.5 text-brand-gold" />
              {minutes} min read
            </span>
          </div>
        </div>

        {/* 2-Column Layout: Left Main Content (8 cols) + Right Sticky Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Main Article Body */}
          <main className="lg:col-span-8 space-y-8">
            {/* Feature Photo */}
            {(article.featuredMedia || article.featuredImage) && (
              <figure className="bg-brand-white border-2 border-brand-black p-3 shadow-lg">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-charcoal">
                  <Image
                    src={
                      article.featuredMedia
                        ? resolveImageMediaUrl(article.featuredMedia, { width: 1200 })
                        : article.featuredImage || "/images/trade_test_centre_1782920400836.png"
                    }
                    alt={isFilenameLike(article.featuredMedia?.altText) ? article.title : (article.featuredMedia?.altText || article.title)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                    priority
                  />
                </div>
                {caption && (
                  <figcaption className="mt-3 text-xs text-brand-charcoal/80 leading-relaxed font-serif italic border-t border-brand-black/10 pt-2">
                    {caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Content Card */}
            <div className="bg-brand-white border border-brand-black/15 p-8 md:p-12 shadow-sm">
              <div
                className="prose prose-lg max-w-none 
                  font-sans text-brand-black/85 leading-relaxed
                  prose-p:text-brand-black/85 prose-p:leading-relaxed prose-p:mb-6
                  prose-p:first-of-type:first-letter:text-6xl 
                  prose-p:first-of-type:first-letter:font-serif 
                  prose-p:first-of-type:first-letter:float-left 
                  prose-p:first-of-type:first-letter:mr-3.5 
                  prose-p:first-of-type:first-letter:leading-none 
                  prose-p:first-of-type:first-letter:text-brand-black
                  prose-headings:font-serif prose-headings:font-normal prose-headings:text-brand-black
                  prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:border-b prose-h2:border-brand-black/15 prose-h2:pb-3 prose-h2:mt-10
                  prose-strong:text-brand-black prose-strong:font-bold
                  prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:border-brand-gold prose-blockquote:text-brand-black/90
                  prose-img:rounded-none prose-img:border prose-img:border-brand-black/20 prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
              />
            </div>
          </main>

          {/* Right Column: Sticky Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--site-header-height)+2rem)] lg:self-start space-y-8">
            {/* Factsheet Box */}
            <div className="bg-brand-white border border-brand-black/20 p-6 shadow-sm font-sans">
              <h3 className="font-serif text-lg font-bold text-brand-black uppercase tracking-wider border-b-2 border-brand-black pb-2 mb-4 flex items-center justify-between">
                <span>At a Glance</span>
                <span className="text-[10px] font-mono font-normal text-brand-muted">PRESS BRIEF</span>
              </h3>

              <dl className="space-y-4 text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Classification</dt>
                  <dd className="font-semibold text-brand-black mt-0.5">
                    {article.newsType || "Official Press Release"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Issuing Desk</dt>
                  <dd className="font-semibold text-brand-black mt-0.5">
                    {article.author?.name || "Corporate Communications Desk"}
                  </dd>
                </div>

                {publishedLabel && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Release Date</dt>
                    <dd className="text-brand-charcoal mt-0.5">{publishedLabel}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Reading Time</dt>
                  <dd className="text-brand-charcoal mt-0.5">{minutes} minutes</dd>
                </div>

                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Language</dt>
                  <dd className="text-brand-charcoal mt-0.5 uppercase">{article.lang || "en"}</dd>
                </div>
              </dl>
            </div>

            {/* Related Dispatches Widget in Right Sidebar */}
            {relatedNews.length > 0 && (
              <div className="bg-brand-white border border-brand-black/20 p-6 shadow-sm font-sans">
                <h4 className="font-serif text-base font-bold text-brand-black uppercase tracking-wider border-b-2 border-brand-black pb-2 mb-4 flex items-center justify-between">
                  <span>In This Edition</span>
                  <Bookmark className="w-4 h-4 text-brand-gold" />
                </h4>

                <div className="space-y-4">
                  {relatedNews.map((relItem) => (
                    <article key={relItem.id} className="border-b border-brand-black/10 pb-3 last:border-0 last:pb-0 group">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold block mb-1">
                        {relItem.newsType || "Notice"}
                      </span>
                      <Link href={toPublicHref(`/news/${relItem.slug}`)}>
                        <h5 className="font-serif text-sm font-normal text-brand-black group-hover:text-brand-gold transition-colors line-clamp-2 leading-snug">
                          {relItem.title}
                        </h5>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom Full-Width Related Dispatches */}
        {relatedNews.length > 0 && (
          <section className="mt-24 pt-12 border-t-2 border-brand-black">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-2xl md:text-3xl font-normal text-brand-black">
                More Press Dispatches in this Edition
              </h3>
              <Link
                href="/news"
                className="text-xs uppercase tracking-widest font-bold text-brand-black hover:text-brand-gold transition-colors flex items-center gap-1"
              >
                View Full Index
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedNews.map((relItem) => (
                <article key={relItem.id} className="bg-brand-white border border-brand-black/15 p-6 hover:shadow-lg transition-all group">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block mb-2">
                    {relItem.newsType || "Notice"}
                  </span>
                  <Link href={toPublicHref(`/news/${relItem.slug}`)}>
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
                    href={toPublicHref(`/news/${relItem.slug}`)}
                    className="text-[11px] uppercase tracking-widest font-bold text-brand-black flex items-center gap-1"
                  >
                    Read Dispatch <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

