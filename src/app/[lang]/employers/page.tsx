import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { HeroRenderer } from "@/components/cms/HeroRenderer";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";

import { buildPageMetadata } from "@/lib/seo/metadata";

import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const seo = await getPageSeo("/employers", lang);
  return buildPageMetadata({
    title: seo?.metaTitle || "Hire Nepali Workers | Recruitment Agency for Gulf & Europe",
    description: seo?.metaDescription || "Hire Nepali workers for GCC and European projects through structured sourcing, screening, trade testing, and ethical recruitment support from Nepal.",
    path: "/employers",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function EmployersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const page = await getPageBySlug("employers");
  
  if (!page) {
    notFound();
  }

  const defaultTitle = "Hire Skilled Nepali Workers for Global Projects";
  const defaultSubtitle = "supporting employers with a structured and transparent recruitment process.";
  const defaultImage = "/images/corporate_office_interview_1782920412325.png";

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
