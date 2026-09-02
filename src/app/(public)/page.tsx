import { getContentBlocksByPageSlug, getFooterSettings, getHeroByPageSlug } from "@/repositories/content-resolver";
import { DynamicHero } from "@/components/cms/DynamicHero";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

import { getPageSeo } from "@/repositories/content-resolver";

// insight_preview now renders live published insights; ISR keeps the homepage
// fresh (revalidateInsightCaches also purges "/" on publish).
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/");
  return buildPageMetadata({
    title: seo?.metaTitle || "Overseas Recruitment Agency in Nepal | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Seven Seas Intercontinental connects global employers with trained Nepali workers through ethical recruitment practices, fee-transparency guidance, and pre-departure support.",
    path: "/",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function HomePage() {
  const [hero, blocks, footerSettings] = await Promise.all([
    getHeroByPageSlug("home"),
    getContentBlocksByPageSlug("home"),
    getFooterSettings(),
  ]);

  return (
    <>
      {hero && <DynamicHero hero={hero} certificationLogos={footerSettings.certificationLogos} />}
      
      {blocks.map(block => (
        <ContentBlockRenderer key={block.id} block={block} />
      ))}
    </>
  );
}
