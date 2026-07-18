import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { HeroRenderer } from "@/components/cms/HeroRenderer";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";

import { buildPageMetadata } from "@/lib/seo/metadata";

import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/ethical-recruitment");
  return buildPageMetadata({
    title: seo?.metaTitle || "Ethical Recruitment Practices | Fee Transparency & Worker Protection",
    description: seo?.metaDescription || "Learn about our ethical recruitment practices in Nepal. We emphasize fee transparency, worker protection, and RBA-aligned controls where applicable for overseas employment.",
    path: "/ethical-recruitment",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function EthicalRecruitmentPage() {
  const page = await getPageBySlug("ethical-recruitment");
  
  if (!page) {
    notFound();
  }

  const defaultTitle = "Commitment to Ethical Recruitment Practices";
  const defaultSubtitle = "At Seven Seas Intercontinental, ethical recruitment means clear communication, fee transparency, worker-safety guidance, and responsible documentation practices. Our process is guided by international labour principles and RBA-aligned controls where applicable.";
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
