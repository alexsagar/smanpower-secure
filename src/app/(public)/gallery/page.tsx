import type { Metadata } from "next";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPageBySlug, getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/gallery");
  return buildPageMetadata({
    title: seo?.metaTitle || "Gallery | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Gallery",
    path: "/gallery",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function GalleryPage() {
  const page = await getPageBySlug("gallery");

  return (
    <main className="min-h-screen bg-brand-off-white">
      <header className="container-wide mx-auto px-6 pb-8 pt-28 sm:pb-12 sm:pt-32">
        <h1 className="text-4xl font-heading font-semibold text-brand-charcoal sm:text-5xl">{page?.title || "Gallery"}</h1>
      </header>
      {page?.blocks.map((block) => <ContentBlockRenderer key={block.id} block={block} />)}
    </main>
  );
}
