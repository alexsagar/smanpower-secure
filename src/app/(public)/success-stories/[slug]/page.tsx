import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getStoryBySlug } from "@/repositories/content-resolver";
import { buildPageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/html-safety";
import { resolveImageMediaUrl } from "@/lib/media-resolver";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return buildPageMetadata({ title: "Not Found", path: "" });
  }

  return buildPageMetadata({
    title: story.metaTitle || story.title,
    description: story.metaDescription || story.summary,
    path: `/success-stories/${slug}`,
    canonicalOverride: story.canonicalUrl,
    ogImage: story.ogImage || story.featuredImage?.secureUrl,
    noIndex: story.noIndex,
  });
}

export default async function SuccessStoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const kicker = story.storyType === "EMPLOYER" ? "Employer Partnership" : "Candidate Story";
  const caption = story.featuredImage?.caption || story.personName;

  return (
    // Magazine layout: a text masthead rather than a photo hero, with the
    // portrait set beside the body on desktop and above it on narrow screens.
    // No hero means the page owes itself the fixed header's height.
    <article className="bg-brand-off-white pb-24 pt-[calc(var(--site-header-height)+3rem)]">
      <div className="container-wide mx-auto px-6 lg:px-12 max-w-5xl">
        <header className="max-w-3xl">
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-6 block">
            {kicker}
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter leading-[1.05] text-brand-black">
            {story.title}
          </h1>
        </header>

        {/* Byline: name (when consented), occupation/location, industry, country.
            Built from a filtered list so a missing part never leaves a dangling separator. */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted mt-10 mb-12 border-y border-brand-charcoal/10 py-6">
          {[story.personName, story.summary, story.industry, story.country]
            .filter(Boolean)
            .map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="w-1 h-1 bg-brand-gold rounded-full" />}
                <span>{part}</span>
              </React.Fragment>
            ))}
        </div>

        <div
          className={
            story.featuredImage
              ? "grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16"
              : ""
          }
        >
          {story.featuredImage && (
            <figure className="lg:sticky lg:top-[calc(var(--site-header-height)+2rem)] lg:self-start">
              <div className="relative aspect-[4/5] overflow-hidden bg-brand-charcoal/5">
                <Image
                  src={resolveImageMediaUrl(story.featuredImage, { width: 800 })}
                  alt={story.featuredImage.altText || story.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 340px"
                  className="object-cover"
                  priority
                />
              </div>
              {caption && (
                <figcaption className="mt-4 text-xs text-brand-muted leading-relaxed border-l-2 border-brand-gold pl-3">
                  {caption}
                </figcaption>
              )}
            </figure>
          )}

          <div>
            {story.quote && (
              <blockquote className="text-2xl font-light italic border-l-4 border-brand-gold pl-6 mb-12 text-brand-charcoal">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
            )}

            {/* Body — same editorial typography as insight articles. */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-brand-black prose-p:text-brand-black/80 prose-li:text-brand-black/80 prose-a:text-brand-gold-dark hover:prose-a:text-brand-charcoal prose-strong:text-brand-black prose-blockquote:border-brand-gold prose-blockquote:text-brand-charcoal prose-img:rounded-sm prose-img:my-8"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(story.content) }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
