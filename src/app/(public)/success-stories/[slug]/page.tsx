import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getStoryBySlug } from "@/repositories/content-resolver";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
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

  return (
    <>
      <HeroInternal 
        title={story.title}
        subtitle={story.storyType === "EMPLOYER" ? "Employer Partnership" : "Candidate Story"}
        imageSrc={story.featuredImage ? resolveImageMediaUrl(story.featuredImage, { width: 1920 }) : "/images/hero_medical_checkup_1782920391480.png"}
      />
      <section className="py-24 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12 max-w-4xl">
          {/* Byline: name (when consented), occupation/location, industry, country.
              Built from a filtered list so a missing part never leaves a dangling separator. */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted mb-12 border-b border-brand-charcoal/10 pb-8">
            {[story.personName, story.summary, story.industry, story.country]
              .filter(Boolean)
              .map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="w-1 h-1 bg-brand-gold rounded-full" />}
                  <span>{part}</span>
                </React.Fragment>
              ))}
          </div>

          {story.quote && (
            <blockquote className="text-2xl font-light italic border-l-4 border-brand-gold pl-6 mb-12 text-brand-charcoal">
              "{story.quote}"
            </blockquote>
          )}

          {/* Body — same editorial typography as insight articles. */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-brand-black prose-p:text-brand-black/80 prose-li:text-brand-black/80 prose-a:text-brand-gold-dark hover:prose-a:text-brand-charcoal prose-strong:text-brand-black prose-blockquote:border-brand-gold prose-blockquote:text-brand-charcoal prose-img:rounded-sm prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(story.content) }}
          />
        </div>
      </section>
    </>
  );
}
