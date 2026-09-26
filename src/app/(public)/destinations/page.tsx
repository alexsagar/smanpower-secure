import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { getContentBySlug, linkDestinationFeatures } from "@/lib/content";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

const CMS_SLUG = "destinations";
const PATH = "/destinations";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildDynamicPageMetadata("standalone", CMS_SLUG, { cmsSlug: CMS_SLUG, path: PATH });
}

export default async function DestinationsPage() {
  const content = await getDynamicPageContent("standalone", CMS_SLUG, {
    cmsSlug: CMS_SLUG,
    path: PATH,
  });

  if (!content) notFound();

  // Make each country card a link from its stable `destinationSlug` (never its
  // editable title). The code-defined hub cards supply the slug when the
  // resolved content came from the CMS; cards with no slug stay non-clickable.
  const linkedContent = {
    ...content,
    features: linkDestinationFeatures(
      content.features,
      getContentBySlug("standalone", CMS_SLUG)?.features
    ),
  };

  return (
    <DynamicPageTemplate
      content={linkedContent}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Recruitment by Destination", path: PATH },
      ]}
    />
  );
}
