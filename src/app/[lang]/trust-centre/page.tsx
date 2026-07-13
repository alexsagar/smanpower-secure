import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { HeroRenderer } from "@/components/cms/HeroRenderer";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";

import { buildPageMetadata } from "@/lib/seo/metadata";

import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const seo = await getPageSeo("/trust-centre", lang);
  return buildPageMetadata({
    title: seo?.metaTitle || "Recruitment Compliance & Trust Centre | Seven Seas Intercontinental",
    description: seo?.metaDescription || "View available licenses, compliance documents, and transparency resources from Seven Seas Intercontinental, an overseas recruitment agency in Nepal.",
    path: "/trust-centre",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function TrustCentrePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const page = await getPageBySlug("trust-centre");
  
  if (!page) {
    notFound();
  }

  const defaultTitle = "Official Compliance & Trust Centre";
  const defaultSubtitle = "Our Trust Centre brings together available company documents, license information, compliance resources, and worker-protection guidance so candidates and employers can verify information through official channels.";
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
        <ContentBlockRenderer key={block.id} block={block} lang={lang} />
      ))}
    </>
  );
}
