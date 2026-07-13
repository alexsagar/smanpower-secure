import { getDictionary, hasLocale } from "./dictionaries";
import { notFound } from "next/navigation";
import { getContentRepository } from "@/repositories/content-resolver";
import { DynamicHero } from "@/components/cms/DynamicHero";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const seo = await getPageSeo("/", lang);
  return buildPageMetadata({
    title: seo?.metaTitle || "Overseas Recruitment Agency in Nepal | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Seven Seas Intercontinental connects global employers with trained Nepali workers through ethical recruitment practices, fee-transparency guidance, and pre-departure support.",
    path: "/",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const repo = getContentRepository();
  
  const hero = await repo.getHeroByPageSlug("home");
  const blocks = await repo.getContentBlocksByPageSlug("home");

  return (
    <>
      {hero && <DynamicHero hero={hero} lang={lang} />}
      
      {blocks.map(block => (
        <ContentBlockRenderer key={block.id} block={block} lang={lang} />
      ))}
    </>
  );
}
