import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { getPageCopy } from "@/services/page-copy.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { prisma } from "@/lib/prisma";
import { NewsMagazineGrid } from "@/components/cms/NewsMagazineGrid";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await prisma.sEOPageMeta.findUnique({
    where: { pagePath_lang: { pagePath: "/news", lang: "en" } },
  });
  return buildPageMetadata({
    title: seo?.metaTitle || "Newsroom & Press Dispatches | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Official company announcements, recruitment notices, and press releases from Seven Seas Intercontinental.",
    path: "/news",
    canonicalOverride: seo?.canonicalUrl || undefined,
    ogImage: seo?.ogImage || undefined,
    noIndex: seo?.noIndex,
  });
}

export default async function NewsroomPage() {
  const copy = await getPageCopy("news");
  const news = await prisma.newsArticle.findMany({
    where: { status: "PUBLISHED", isPublished: true, deletedAt: null, lang: "en" },
    include: { featuredMedia: true, author: true },
    orderBy: [{ publishDate: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <>
      <HeroInternal 
        title={copy.hero.title || "Newsroom & Official Dispatches"} 
        subtitle={copy.hero.subtitle || "Press Releases, Company Announcements & Notice Board"} 
        imageSrc={copy.hero.imageSrc} 
      />

      <section className="py-20 lg:py-28 bg-brand-off-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          {!copy.hiddenSections.intro && (
          <div className="max-w-4xl mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-3 bg-brand-black text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-6 border border-brand-gold/30">
                <span>Official Newsroom</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black mb-6">
                Corporate Announcements & Press Releases
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-brand-charcoal/80 font-sans max-w-3xl">
                Stay informed with official press dispatches, trade center accreditation notices, regulatory updates, and corporate milestone announcements.
              </p>
            </ScrollReveal>
          </div>
          )}

          <ScrollReveal>
            <NewsMagazineGrid
              articles={news as any}
              emptyStateHeading={copy.emptyState?.heading || "No published notices in this issue."}
              emptyStateBody={copy.emptyState?.body || "Check back soon for the latest corporate announcements."}
              readMoreLabel={copy.readMoreLabel || "Read Full Dispatch"}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      {!copy.hiddenSections.cta && (
      <section className="py-24 bg-brand-black text-brand-white relative overflow-hidden border-t-2 border-brand-gold/40">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-2/3">
            <span className="text-brand-gold text-[10px] font-mono tracking-[0.3em] uppercase block mb-3">
              Media & Corporate Relations
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight leading-tight text-brand-white mb-6">
              Need press statements or <span className="text-brand-gold italic">media accreditation?</span>
            </h2>
            <p className="text-lg text-brand-white/70 max-w-2xl leading-relaxed font-sans">
              For official press inquiries, media kits, or interview requests with Seven Seas leadership, contact our corporate communications desk.
            </p>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 bg-brand-gold text-brand-black px-10 py-5 hover:bg-brand-white transition-colors duration-300 text-xs font-bold tracking-widest uppercase group"
            >
              Contact Press Desk
              <div className="w-8 h-[1px] bg-brand-black group-hover:w-12 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </section>
      )}
    </>
  );
}

