import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { destinationHrefForFeature } from "@/lib/content";
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

  // The country cards ("Countries With a Destination Page") carry only a
  // title/desc; attach each one's destination href so the whole card becomes a
  // link. Cards with no matching destination page are left untouched.
  const linkedContent = {
    ...content,
    features: content.features?.map((feature) => {
      const href = destinationHrefForFeature(feature.title);
      return href ? { ...feature, href } : feature;
    }),
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
