import { toPublicHref } from "@/lib/public-href";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await prisma.sEOPageMeta.findUnique({
    where: { pagePath_lang: { pagePath: "/news", lang: "en" } },
  });
  return buildPageMetadata({
    title: seo?.metaTitle || "Newsroom | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Published company notices, updates, and press releases.",
    path: "/news",
    canonicalOverride: seo?.canonicalUrl || undefined,
    ogImage: seo?.ogImage || undefined,
    noIndex: seo?.noIndex,
  });
}

export default async function NewsroomPage() {
  const news = await prisma.newsArticle.findMany({
    where: { status: "PUBLISHED", isPublished: true, deletedAt: null, lang: "en" },
    include: { featuredMedia: true },
    orderBy: [{ publishDate: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <>
      <HeroInternal title="Newsroom." subtitle="Newsroom" imageSrc="/images/trade_test_centre_1782920400836.png" />
      <section className="py-24 md:py-32 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12">
          {news.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-3xl font-semibold text-brand-black mb-4">No news has been published yet.</h2>
              <p className="text-brand-muted">Please check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item, index) => (
                <ScrollReveal key={item.id} delay={index * 0.05}>
                  <Link href={toPublicHref(`/news/${item.slug}`)} className="group block bg-white border border-brand-charcoal/10 p-8 hover:border-brand-gold hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">
                      <span>{item.newsType || "News"}</span>
                      <span>{item.publishDate ? new Date(item.publishDate).toLocaleDateString() : ""}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-brand-black mb-4 group-hover:text-brand-gold transition-colors">{item.title}</h2>
                    <p className="text-brand-muted leading-relaxed mb-6 line-clamp-3">{item.summary || "Read the full update."}</p>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold">
                      Read Update <ArrowRight className="w-4 h-4" />
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
