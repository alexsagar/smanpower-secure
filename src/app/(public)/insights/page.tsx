import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { getPageCopy } from "@/services/page-copy.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { prisma } from "@/lib/prisma";
import { InsightMagazineGrid } from "@/components/cms/InsightMagazineGrid";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await prisma.sEOPageMeta.findUnique({
    where: { pagePath_lang: { pagePath: "/insights", lang: "en" } },
  });
  return buildPageMetadata({
    title: seo?.metaTitle || "Recruitment Insights & Compliance Chronicles | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Published articles, regulatory updates, market reports, and recruitment guides by Seven Seas Intercontinental.",
    path: "/insights",
    canonicalOverride: seo?.canonicalUrl || undefined,
    ogImage: seo?.ogImage || undefined,
    noIndex: seo?.noIndex,
  });
}

export default async function InsightsPage() {
  const copy = await getPageCopy("insights");
  const articles = await prisma.insightArticle.findMany({
    where: { status: "PUBLISHED", deletedAt: null, lang: "en" },
    include: { featuredImage: true, category: true, author: true },
    orderBy: [{ isFeatured: "desc" }, { publishDate: "desc" }],
  });

  return (
    <>
      <HeroInternal 
        title={copy.hero.title || "Industry Insights & Chronicles"} 
        subtitle={copy.hero.subtitle || "Expertise on Ethical Overseas Recruitment & Compliance"} 
        imageSrc={copy.hero.imageSrc} 
      />

      <section className="py-20 lg:py-28 bg-brand-off-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          {!copy.hiddenSections.intro && (
          <div className="max-w-4xl mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-3 bg-brand-black text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-6 border border-brand-gold/30">
                <span>Editorial Dispatch</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black mb-6">
                Market Intelligence & Ethical Standards
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-brand-charcoal/80 font-sans max-w-3xl">
                In-depth reports, legal compliance frameworks, and practical guidance for employers and overseas jobseekers across the Gulf, Middle East, and Asia.
              </p>
            </ScrollReveal>
          </div>
          )}

          <ScrollReveal>
            <InsightMagazineGrid
              articles={articles as any}
              emptyStateHeading={copy.emptyState?.heading || "No published insights in this edition."}
              emptyStateBody={copy.emptyState?.body || "Check back soon for new market intelligence reports."}
              readMoreLabel={copy.readMoreLabel || "Read Feature Article"}
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
              Subscribe to Market Intelligence
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight leading-tight text-brand-white mb-6">
              Need custom manpower analysis for <span className="text-brand-gold italic">your enterprise?</span>
            </h2>
            <p className="text-lg text-brand-white/70 max-w-2xl leading-relaxed font-sans">
              Connect with our recruitment advisory team for tailored talent deployment strategies, salary benchmark studies, and compliance audits.
            </p>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 bg-brand-gold text-brand-black px-10 py-5 hover:bg-brand-white transition-colors duration-300 text-xs font-bold tracking-widest uppercase group"
            >
              Consult Our Analysts
              <div className="w-8 h-[1px] bg-brand-black group-hover:w-12 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </section>
      )}
    </>
  );
}

