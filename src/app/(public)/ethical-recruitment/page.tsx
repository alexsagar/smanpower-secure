import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { HeroRenderer } from "@/components/cms/HeroRenderer";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";
import { EthicalHero } from "@/components/ethical/EthicalHero";
import { EthicalPillarsHub } from "@/components/ethical/EthicalPillarsHub";
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

  const defaultTitle = "Doing What Is Right. Always.";
  const defaultSubtitle = "At Seven Seas Intercontinental, ethical recruitment is our foundation—not an afterthought. We enforce zero recruitment fees, total contract transparency, and RBA-aligned worker protections across every deployment.";

  const hasBlocks = Boolean(page.blocks && page.blocks.length > 0);

  return (
    <main className="min-h-screen bg-brand-off-white text-brand-black">
      {/* High impact Ethical Hero */}
      {page.hero ? (
        <HeroRenderer 
          hero={page.hero}
          fallbackTitle={defaultTitle}
          fallbackSubtitle={defaultSubtitle}
          fallbackImage="/images/hero_training_orientation_1782920391505.png"
        />
      ) : (
        <EthicalHero title={defaultTitle} subtitle={defaultSubtitle} />
      )}

      {/* Render CMS blocks */}
      {hasBlocks ? (
        page.blocks?.map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))
      ) : (
        <EthicalPillarsHub />
      )}

      {/* Institutional Ethical Pillars Hub to ensure next level presentation */}
      {hasBlocks && (
        <EthicalPillarsHub />
      )}
    </main>
  );
}
