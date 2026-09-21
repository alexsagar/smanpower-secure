import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import { buildEmploymentAgencySchema } from "@/lib/seo/schema";
import { getSiteUrl } from "@/lib/seo/site-config";
import { CONTACT } from "@/lib/constants";

const CMS_SLUG = "manpower-agency-in-kathmandu";
const PATH = "/manpower-agency-in-kathmandu";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildDynamicPageMetadata("standalone", CMS_SLUG, { cmsSlug: CMS_SLUG, path: PATH });
}

export default async function KathmanduOfficePage() {
  const content = await getDynamicPageContent("standalone", CMS_SLUG, {
    cmsSlug: CMS_SLUG,
    path: PATH,
  });

  if (!content) notFound();

  const siteUrl = getSiteUrl();
  // Only the verified single office, and only the fields shown on the page.
  const officeSchema = buildEmploymentAgencySchema({
    canonicalUrl: siteUrl ? `${siteUrl}${PATH}` : "",
    name: "Seven Seas Intercontinental",
    streetAddress: "DAI Complex, Panchakanya Marga, Guheswori",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati Province",
    postalCode: "44600",
    addressCountry: "NP",
    telephone: CONTACT.phone,
    email: CONTACT.email,
  });

  return (
    <>
      {officeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(officeSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <DynamicPageTemplate
        content={content}
        breadcrumbs={[
          { name: "Home", path: "" },
          { name: "Manpower Agency in Kathmandu", path: PATH },
        ]}
      />
    </>
  );
}
