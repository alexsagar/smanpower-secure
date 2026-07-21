import { notFound } from "next/navigation";
import { getPageCopy } from "@/services/page-copy.service";
import Image from "next/image";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Quote } from "lucide-react";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedStories } from "@/repositories/content-resolver";
import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/success-stories");
  return buildPageMetadata({
    title: seo?.metaTitle || "Overseas Recruitment Success Stories | Seven Seas Nepal",
    description: seo?.metaDescription || "Read published stories from candidates and employers featured by Seven Seas Intercontinental.",
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
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        imageSrc={copy.hero.imageSrc}
      />

      <section className="py-24 md:py-32 bg-brand-black text-brand-white relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
        
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mb-24">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {copy.intro.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-white mb-8">
                {copy.intro.heading}
              </h2>
              <p className="text-xl leading-relaxed text-brand-white/60 font-light max-w-2xl">
                {copy.intro.body}
              </p>
            </ScrollReveal>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-light text-brand-white/80">{copy.emptyState}</h3>
            </div>
          ) : (
            <div className="space-y-32">
              {stories.map((story, i) => (
                <div key={story.id} className="relative">
                  <ScrollReveal>
                    <div className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}>
                      
                      {/* Image Section */}
                      <div className="w-full lg:w-1/2 relative">
                        <div className="relative aspect-[4/3] overflow-hidden group bg-brand-charcoal">
                          <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                          <Image 
                            src={story.featuredImage?.secureUrl || "/images/hero_training_orientation_1782920391505.png"} 
                            alt={story.featuredImage?.altText || story.title} 
                            fill 
                            className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]" 
                          />
                          <div className={`absolute ${i % 2 === 0 ? '-bottom-4 -right-4' : '-bottom-4 -left-4'} w-32 h-32 bg-brand-gold/20 blur-[40px] rounded-full z-0`} />
                        </div>
                        
                        {/* Floating Data Tag */}
                        <div className={`absolute ${i % 2 === 0 ? '-bottom-6 left-8' : '-bottom-6 right-8'} z-20`}>
                          <div className="bg-brand-white text-brand-black px-6 py-4 flex items-center gap-4 shadow-2xl">
                            <span className="font-mono text-brand-charcoal/40 text-xs">0{i + 1}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold">
                              {story.storyType === "EMPLOYER" ? "Employer Partnership" : "Candidate Story"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <Quote className="w-12 h-12 text-brand-gold/30 mb-8" />
                        
                        <p className="text-2xl md:text-3xl lg:text-4xl leading-tight font-light text-brand-white mb-12 relative z-10">
                          "{story.quote || story.summary || story.title}"
                        </p>
                        
                        <div className="border-t border-brand-white/10 pt-8 mt-auto">
                          <h3 className="text-2xl font-semibold text-brand-gold mb-2">{story.personName || story.title}</h3>
                          <p className="text-brand-white/60 text-sm uppercase tracking-widest mb-8">
                            {story.industry || story.country || "Success Story"}
                          </p>
                          <Link href={`/success-stories/${story.slug}`} className="text-xs uppercase tracking-widest font-semibold text-brand-white hover:text-brand-gold transition-colors">
                            {copy.readMoreLabel}
                          </Link>
                        </div>
                      </div>
                      
                    </div>
                  </ScrollReveal>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Universal CTA */}
      <section className="py-24 bg-brand-off-white relative overflow-hidden">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-2/3">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter leading-tight text-brand-black mb-6">
              {copy.cta.headingLead}<span className="text-brand-gold italic font-serif">{copy.cta.headingHighlight}</span>
            </h2>
            <p className="text-lg text-brand-muted max-w-2xl leading-relaxed">
              {copy.cta.body}
            </p>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <Link href="/contact" className="inline-flex items-center gap-4 bg-brand-black text-brand-white px-10 py-5 hover:bg-brand-gold hover:text-brand-black transition-colors duration-300 text-sm font-semibold tracking-widest uppercase group">
              {copy.cta.buttonLabel}
              <div className="w-8 h-[1px] bg-brand-white group-hover:w-12 group-hover:bg-brand-black transition-all duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
