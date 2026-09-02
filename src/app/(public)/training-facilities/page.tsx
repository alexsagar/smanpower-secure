import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { HeroRenderer } from "@/components/cms/HeroRenderer";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";

import { buildPageMetadata } from "@/lib/seo/metadata";

import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/training-facilities");
  return buildPageMetadata({
    title: seo?.metaTitle || "Pre-Departure Training Nepal | Trade Testing & Orientation",
    description: seo?.metaDescription || "Explore trade testing, orientation, and pre-departure preparation support in Nepal for workers preparing for overseas employment.",
    path: "/training-facilities",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export const revalidate = 86400;

export default async function TrainingFacilitiesPage() {


  const page = await getPageBySlug("training-facilities");
  
  if (!page) {
    notFound();
  }

  const defaultTitle = "Pre-Departure Training & Trade Testing in Nepal";
  const defaultSubtitle = "Proper preparation is the key to successful overseas deployment. Our dedicated training facilities in Nepal conduct rigorous trade testing and mandatory pre-departure orientation. We coordinate required medical screening and support workers with orientation and preparation.";
  const defaultImage = "/images/trade_test_centre_1782920400836.png";

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
