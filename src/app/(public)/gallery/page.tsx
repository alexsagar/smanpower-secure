import type { Metadata } from "next";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPageBySlug, getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/gallery");
  return buildPageMetadata({ title: seo?.metaTitle || "Gallery", description: seo?.metaDescription || "", path: "/gallery", canonicalOverride: seo?.canonicalUrl, ogImage: seo?.ogImage, noIndex: seo?.noIndex });
}

export default async function GalleryPage() {
  const page = await getPageBySlug("gallery");
  return (
    <>
      <header className="bg-brand-charcoal px-6 py-32 text-brand-white lg:px-12">
        <div className="container-wide mx-auto"><h1 className="text-5xl font-bold tracking-tighter md:text-7xl">{page?.title || "Gallery"}</h1></div>
      </header>
      {page?.blocks.map((block) => <ContentBlockRenderer key={block.id} block={block} />)}
    </>
  );
}
