import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
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

  return (
    <DynamicPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Recruitment by Destination", path: PATH },
      ]}
    />
  );
}
