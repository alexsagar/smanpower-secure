import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { sanitizeHtml } from "@/lib/html-safety";
import { prisma } from "@/lib/prisma";

async function getInsight(lang: string, slug: string) {
  return prisma.insightArticle.findFirst({
    where: { slug, lang, status: "PUBLISHED", deletedAt: null },
    include: { featuredImage: true, category: true, author: true },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const insight = await getInsight(lang, slug);
  if (!insight) return buildPageMetadata({ title: "Not Found", path: "" });
  return buildPageMetadata({
    title: insight.metaTitle || insight.title,
    description: insight.metaDescription || insight.summary || undefined,
    path: `/insights/${slug}`,
    canonicalOverride: insight.canonicalUrl || undefined,
    ogImage: insight.ogImage || insight.featuredImage?.fileUrl || undefined,
    noIndex: insight.noIndex || false,
  });
}

export default async function InsightDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const insight = await getInsight(lang, slug);
  if (!insight) notFound();

  return (
    <>
      <HeroInternal title={insight.title} subtitle={insight.category?.name || "Insight"} imageSrc={insight.featuredImage?.fileUrl || "/images/hero_training_orientation_1782920391505.png"} />
      <section className="py-24 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12 max-w-4xl">
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted mb-12 border-b border-brand-charcoal/10 pb-8">
            <span>{insight.author?.name || "Editorial Team"}</span>
            <span className="w-1 h-1 bg-brand-gold rounded-full" />
            <span>{insight.publishDate ? new Date(insight.publishDate).toLocaleDateString() : ""}</span>
          </div>
          <div className="prose prose-lg max-w-none text-brand-black/80 prose-headings:text-brand-black prose-a:text-brand-gold hover:prose-a:text-brand-charcoal prose-img:rounded-sm">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(insight.content) }} />
          </div>
        </div>
      </section>
    </>
  );
}
