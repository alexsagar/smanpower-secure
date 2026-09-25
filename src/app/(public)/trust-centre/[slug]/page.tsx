import { notFound } from "next/navigation";
import { trustContent } from "@/lib/content";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import type { Metadata } from "next";

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
  return trustContent.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildDynamicPageMetadata("trust-centre", slug);
}

export default async function TrustDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("trust-centre", slug);

  if (!content) notFound();

  return (
    <DynamicPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Trust Centre", path: "/trust-centre" },
        { name: content.title, path: `/trust-centre/${slug}` },
      ]}
    />
  );
}
