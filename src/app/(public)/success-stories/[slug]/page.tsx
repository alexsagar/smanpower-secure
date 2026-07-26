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
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted mb-12 border-b border-brand-charcoal/10 pb-8">
            {story.personName && (
              <>
                <span>{story.personName}</span>
                <span className="w-1 h-1 bg-brand-gold rounded-full" />
              </>
            )}
            {story.industry && (
              <>
                <span>{story.industry}</span>
                <span className="w-1 h-1 bg-brand-gold rounded-full" />
              </>
            )}
            {story.country && <span>{story.country}</span>}
          </div>

          {story.quote && (
            <blockquote className="text-2xl font-light italic border-l-4 border-brand-gold pl-6 mb-12 text-brand-charcoal">
              "{story.quote}"
            </blockquote>
          )}

          {story.summary && (
            <p className="text-xl md:text-2xl leading-relaxed text-brand-black font-light mb-12">
              {story.summary}
            </p>
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
