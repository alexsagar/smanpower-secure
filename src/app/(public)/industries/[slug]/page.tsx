import { notFound } from "next/navigation";
import { industriesContent } from "@/lib/content";
import { getDynamicPageContent } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

/**
 * An unknown slug must be a real 404, not a 200 carrying the not-found UI.
 *
 * `notFound()` alone cannot achieve that here: the public segment has a
 * `loading.tsx`, so the response has already begun streaming by the time the
 * page runs, and Next cannot change a status code after headers are sent (see
 * the "Status Codes" note in the Next.js docs). `dynamicParams = false` rejects
 * the slug at the routing layer instead, before any of that.
 *
 * Safe because the valid set is fixed at build time by content.ts: the CMS is
 * seeded from content.ts and has no page-creation path, so a new page always
 * requires a code change and rebuild anyway.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return industriesContent.map((c) => ({ slug: c.slug }));
}

import { buildPageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getDynamicPageContent("industries", slug);
  if (!content) notFound();
  
  return buildPageMetadata({
    title: `${content.title} Recruitment from Nepal`,
    description: `Hire skilled ${content.title} professionals from Nepal. We provide trained, experienced staff for ${content.title} roles across the GCC and Europe.`,
    path: `/industries/${slug}`
  });
}
export default async function IndustriesDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("industries", slug);

  if (!content) notFound();

  return (
    <DynamicPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Industries", path: "/industries" },
        { name: content.title, path: `/industries/${slug}` },
      ]}
    />
  );
}
