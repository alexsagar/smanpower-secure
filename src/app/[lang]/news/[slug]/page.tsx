import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { prisma } from "@/lib/prisma";

async function getNews(lang: string, slug: string) {
  return prisma.newsArticle.findFirst({
    where: { slug, lang, status: "PUBLISHED", isPublished: true, deletedAt: null },
    include: { featuredMedia: true, author: true },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = await getNews(lang, slug);
  if (!article) return buildPageMetadata({ title: "Not Found", path: "" });
  return buildPageMetadata({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.summary || undefined,
    path: `/news/${slug}`,
    ogImage: article.ogImage || article.featuredMedia?.fileUrl || article.featuredImage || undefined,
    noIndex: article.noIndex || false,
  });
}

export default async function NewsDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const article = await getNews(lang, slug);
  if (!article) notFound();

  return (
    <>
      <HeroInternal title={article.title} subtitle={article.newsType || "News"} imageSrc={article.featuredMedia?.fileUrl || article.featuredImage || "/images/trade_test_centre_1782920400836.png"} />
      <section className="py-24 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12 max-w-4xl">
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted mb-12 border-b border-brand-charcoal/10 pb-8">
            <span>{article.author?.name || "Editorial Team"}</span>
            <span className="w-1 h-1 bg-brand-gold rounded-full" />
            <span>{article.publishDate ? new Date(article.publishDate).toLocaleDateString() : ""}</span>
          </div>
          <div className="prose prose-lg max-w-none text-brand-black/80 prose-headings:text-brand-black prose-a:text-brand-gold hover:prose-a:text-brand-charcoal prose-img:rounded-sm">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </section>
    </>
  );
}
