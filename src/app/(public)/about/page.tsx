import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { HeroRenderer } from "@/components/cms/HeroRenderer";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About Our Ethical Recruitment Agency in Nepal",
  description: "Learn about Seven Seas Intercontinental, a trusted and ethical recruitment agency in Nepal committed to connecting global employers with skilled Nepali talent.",
  path: "/about",
});

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  
  if (!page) {
    notFound();
  }

  // Fallbacks if no hero is attached in CMS
  const defaultTitle = "Building Responsible Pathways from Nepal to Global Employment.";
  const defaultSubtitle = "About Seven Seas";
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
