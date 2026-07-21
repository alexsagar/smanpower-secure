import { toPublicHref } from "@/lib/public-href";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { getPageCopy } from "@/services/page-copy.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await prisma.sEOPageMeta.findUnique({
    where: { pagePath_lang: { pagePath: "/insights", lang: "en" } },
  });
  return buildPageMetadata({
    title: seo?.metaTitle || "Recruitment Insights | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Published articles on overseas recruitment, compliance, and workforce management.",
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
    include: { featuredImage: true, category: true },
    orderBy: [{ isFeatured: "desc" }, { publishDate: "desc" }],
  });

  return (
    <>
      <HeroInternal title={copy.hero.title} subtitle={copy.hero.subtitle} imageSrc={copy.hero.imageSrc} />
      <section className="py-24 md:py-32 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-3xl font-semibold text-brand-black mb-4">{copy.emptyState.heading}</h2>
              <p className="text-brand-muted">{copy.emptyState.body}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article, index) => (
                <ScrollReveal key={article.id} delay={index * 0.05}>
                  <Link href={toPublicHref(`/insights/${article.slug}`)} className="group block bg-white border border-brand-charcoal/10 p-8 hover:border-brand-gold hover:shadow-xl transition-all duration-300 h-full">
                    <div className="flex items-center justify-between mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">
                      <span>{article.category?.name || "Insight"}</span>
                      <span>{article.publishDate ? new Date(article.publishDate).toLocaleDateString() : ""}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-brand-black mb-4 group-hover:text-brand-gold transition-colors">{article.title}</h2>
                    <p className="text-brand-muted leading-relaxed mb-8 line-clamp-4">{article.summary || "Read the full article."}</p>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
