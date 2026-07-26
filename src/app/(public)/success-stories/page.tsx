import { getPageCopy } from "@/services/page-copy.service";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedStories } from "@/repositories/content-resolver";
import { getPageSeo } from "@/repositories/content-resolver";
import { StoryMagazineGrid } from "@/components/cms/StoryMagazineGrid";

// Without this the page is prerendered once at build time and never refreshes,
// so newly published stories never appear. Matches /insights, /news and the
// homepage; on-demand revalidation on publish is the fast path, this is the net.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/success-stories");
  return buildPageMetadata({
    title: seo?.metaTitle || "Overseas Recruitment Success Stories & Editorial Chronicles | Seven Seas Nepal",
    description: seo?.metaDescription || "Read verified recruitment success stories, employer partnership case studies, and candidate journey features.",
    path: "/success-stories",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function SuccessStoriesPage() {
  const copy = await getPageCopy("success-stories");
  const stories = await getPublishedStories();

  return (
    <>
      <HeroInternal 
        title={copy.hero.title || "Success Stories & Editorial Features"}
        subtitle={copy.hero.subtitle || "Voices of Candidates and Employer Partnerships"}
        imageSrc={copy.hero.imageSrc}
      />

      <section className="py-20 lg:py-28 bg-brand-off-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-3 bg-brand-black text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-6 border border-brand-gold/30">
                <span>{copy.intro.eyebrow || "Broadsheet Edition"}</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black mb-6">
                {copy.intro.heading || "Stories of Transformation & Strategic Partnerships"}
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-brand-charcoal/80 font-sans max-w-3xl">
                {copy.intro.body || "Discover verified case studies from leading employers and firsthand candidate journeys prepared through ethical recruitment, rigorous skill assessment, and pre-departure support."}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <StoryMagazineGrid
              stories={stories}
              emptyStateMessage={copy.emptyState || "No published stories found."}
              readMoreLabel={copy.readMoreLabel || "Read Feature Article"}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Universal Call to Action */}
      <section className="py-24 bg-brand-black text-brand-white relative overflow-hidden border-t-2 border-brand-gold/40">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-2/3">
            <span className="text-brand-gold text-[10px] font-mono tracking-[0.3em] uppercase block mb-3">
              Write the Next Chapter
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight leading-tight text-brand-white mb-6">
              {copy.cta.headingLead || "Ready to build your "}
              <span className="text-brand-gold italic">{copy.cta.headingHighlight || "success story?"}</span>
            </h2>
            <p className="text-lg text-brand-white/70 max-w-2xl leading-relaxed font-sans">
              {copy.cta.body || "Partner with Seven Seas for ethical talent sourcing or register as a candidate for career placement abroad."}
            </p>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 bg-brand-gold text-brand-black px-10 py-5 hover:bg-brand-white transition-colors duration-300 text-xs font-bold tracking-widest uppercase group"
            >
              {copy.cta.buttonLabel || "Contact Our Team"}
              <div className="w-8 h-[1px] bg-brand-black group-hover:w-12 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

