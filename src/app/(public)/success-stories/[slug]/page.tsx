import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getStoryBySlug, getPublishedStories } from "@/repositories/content-resolver";
import { buildPageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import Link from "next/link";
import { sanitizeHtml } from "@/lib/html-safety";
import { resolveOpenGraphImageUrl, isFilenameLike } from "@/lib/media-resolver";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { stripWrappingQuotes } from "@/lib/utils";
import { ArrowLeft, ArrowUpRight, Quote, MapPin, Briefcase, Building2, UserCheck, Newspaper } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return buildPageMetadata({ title: "Not Found", path: "" });
  }

  return buildPageMetadata({
    title: story.metaTitle || story.title,
    description: story.metaDescription || story.summary || story.title,
    path: `/success-stories/${slug}`,
    canonicalOverride: story.canonicalUrl,
    ogImage: story.ogImage || resolveOpenGraphImageUrl(story.featuredImage),
    noIndex: story.noIndex,
  });
}

export default async function SuccessStoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  // Fetch one more than we show, so dropping the current story still leaves 3.
  const relatedStories = (await getPublishedStories(4)).filter((s) => s.slug !== slug).slice(0, 3);

  const kicker = story.storyType === "EMPLOYER" ? "Corporate Partnership Case Study" : "Voices of the Field • Candidate Story";
  const caption = story.featuredImage?.caption && !isFilenameLike(story.featuredImage.caption)
    ? story.featuredImage.caption
    : (story.featuredImage?.altText && !isFilenameLike(story.featuredImage.altText) ? story.featuredImage.altText : undefined);

  return (
    <article className="bg-brand-off-white pb-24 pt-[calc(var(--site-header-height)+2rem)]">
      {/* Top Editorial Navigation Bar */}
      <div className="container-wide mx-auto px-6 lg:px-12 max-w-6xl mb-8">
        <div className="border-t-2 border-b border-brand-black/20 py-3 flex items-center justify-between">
          <Link
            href="/success-stories"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-black hover:text-brand-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Edition Index
          </Link>
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-brand-muted">
            <Newspaper className="w-3.5 h-3.5 text-brand-gold" />
            <span>Feature Report</span>
          </div>
        </div>
      </div>

      <div className="container-wide mx-auto px-6 lg:px-12 max-w-6xl">
        {/* Article Headline & Deck Header */}
        <header className="max-w-4xl mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-6 border border-brand-gold/30">
            {story.storyType === "EMPLOYER" ? (
              <Building2 className="w-3 h-3" />
            ) : (
              <UserCheck className="w-3 h-3" />
            )}
            <span>{kicker}</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.06] text-brand-black tracking-tight mb-6">
            {story.title}
          </h1>

          {story.summary && (
            <p className="font-sans text-lg md:text-xl text-brand-charcoal/80 leading-relaxed max-w-3xl border-l-4 border-brand-gold pl-5 italic bg-brand-white/80 py-3">
              {story.summary}
            </p>
          )}
        </header>

        {/* Editorial Byline Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold uppercase tracking-widest text-brand-charcoal/70 mb-12 border-y border-brand-black/15 py-4 bg-brand-white/40">
          <div className="flex flex-wrap items-center gap-4">
            {story.personName && (
              <span className="text-brand-black font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-brand-gold rounded-full" />
                {story.personName}
              </span>
            )}
            {story.industry && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-brand-gold" />
                {story.industry}
              </span>
            )}
            {story.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                {story.country}
              </span>
            )}
          </div>
        </div>

        {/* Main Content Grid: Sidebar Factsheet + Article Body */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
          {/* Newspaper Sidebar / Infographic Factsheet */}
          <aside className="lg:sticky lg:top-[calc(var(--site-header-height)+2rem)] lg:self-start space-y-8">
            {story.featuredImage && (
              <figure className="bg-brand-white border-2 border-brand-black p-3 shadow-md">
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-charcoal">
                  <OptimizedImage
                    src={story.featuredImage}
                    preset="successStoryHero"
                    alt={isFilenameLike(story.featuredImage.altText) ? story.title : (story.featuredImage.altText || story.title)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 340px"
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

            {/* Factsheet At-a-Glance Box */}
            <div className="bg-brand-white border border-brand-black/20 p-6 shadow-sm font-sans">
              <h3 className="font-serif text-lg font-bold text-brand-black uppercase tracking-wider border-b-2 border-brand-black pb-2 mb-4 flex items-center justify-between">
                <span>At a Glance</span>
                <span className="text-[10px] font-mono font-normal text-brand-muted">CASE BRIEF</span>
              </h3>

              <dl className="space-y-4 text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Classification</dt>
                  <dd className="font-semibold text-brand-black mt-0.5">
                    {story.storyType === "EMPLOYER" ? "Employer Partnership" : "Candidate Journey"}
                  </dd>
                </div>

                {story.personName && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Subject / Enterprise</dt>
                    <dd className="font-semibold text-brand-black mt-0.5">{story.personName}</dd>
                  </div>
                )}

                {story.summary && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Occupation & Location</dt>
                    <dd className="text-brand-charcoal mt-0.5">{story.summary}</dd>
                  </div>
                )}

                {story.industry && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Industry Sector</dt>
                    <dd className="text-brand-charcoal mt-0.5">{story.industry}</dd>
                  </div>
                )}

                {story.country && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Destination Country</dt>
                    <dd className="text-brand-charcoal mt-0.5">{story.country}</dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>

          {/* Article Main Body */}
          <main className="bg-brand-white border border-brand-black/15 p-8 md:p-12 shadow-sm">
            {story.quote && (
              <blockquote className="text-xl md:text-2xl font-serif italic border-l-4 border-brand-gold pl-6 py-2 mb-10 text-brand-black bg-brand-off-white/60 flex items-start gap-4">
                <Quote className="w-8 h-8 text-brand-gold shrink-0" />
                <span>&ldquo;{stripWrappingQuotes(story.quote)}&rdquo;</span>
              </blockquote>
            )}

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
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(story.content) }}
            />
          </main>
        </div>

        {/* Bottom Section: Related Features */}
        {relatedStories.length > 0 && (
          <section className="mt-24 pt-12 border-t-2 border-brand-black">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-2xl md:text-3xl font-normal text-brand-black">
                More Features from this Edition
              </h3>
              <Link
                href="/success-stories"
                className="text-xs uppercase tracking-widest font-bold text-brand-black hover:text-brand-gold transition-colors flex items-center gap-1"
              >
                View Full Index
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedStories.map((relStory) => (
                <article key={relStory.id} className="bg-brand-white border border-brand-black/15 p-6 hover:shadow-lg transition-all group">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block mb-2">
                    {relStory.storyType === "EMPLOYER" ? "Employer Partner" : "Candidate Story"}
                  </span>
                  <Link href={`/success-stories/${relStory.slug}`}>
                    <h4 className="font-serif text-xl font-normal text-brand-black group-hover:text-brand-gold transition-colors mb-3 line-clamp-2">
                      {relStory.title}
                    </h4>
                  </Link>
                  {relStory.summary && (
                    <p className="text-xs text-brand-muted line-clamp-2 mb-4 font-sans">
                      {relStory.summary}
                    </p>
                  )}
                  <Link
                    href={`/success-stories/${relStory.slug}`}
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
  );
}

