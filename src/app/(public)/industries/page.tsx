import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { HeroRenderer } from "@/components/cms/HeroRenderer";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";

import { buildPageMetadata } from "@/lib/seo/metadata";

import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/industries");
  return buildPageMetadata({
    title: seo?.metaTitle || "Recruitment for Gulf & Europe | Industries We Serve",
    description: seo?.metaDescription || "Seven Seas Intercontinental supports recruitment from Nepal for sectors such as construction, hospitality, security, facility management, and technical trades.",
    path: "/industries",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export const revalidate = 86400;

export default async function IndustriesPage() {


  const page = await getPageBySlug("industries");
  
  if (!page) {
    notFound();
  }

  const defaultTitle = "Specialized Overseas Recruitment by Industry";
  const defaultSubtitle = "Our Nepal manpower agency provides targeted recruitment solutions tailored to the specific demands of diverse industries. From heavy construction in the Gulf to hospitality roles in Europe, we source and screen Nepali candidates who possess the precise skills your sector requires.";
  const defaultImage = "/images/hero_training_orientation_1782920391505.png";

  return (
    <>
      <HeroRenderer 
        hero={page.hero}
        fallbackTitle={defaultTitle}
        fallbackSubtitle={defaultSubtitle}
        fallbackImage={defaultImage}
      />

      {page.blocks?.map((block) => (
        <ContentBlockRenderer key={block.id} block={block} />
      ))}
    </>
  );
}
