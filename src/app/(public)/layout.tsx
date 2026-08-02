import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleTranslateScript } from "@/components/layout/GoogleTranslateScript";
import { FirstVisitLoader } from "@/components/loading/FirstVisitLoader";
import { publicFontVariables } from "@/lib/fonts";
import "@/app/globals.css";

import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildOrganizationSchema } from "@/lib/seo/schema";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = buildPageMetadata({
  title: "Seven Seas Intercontinental | Ethical Recruitment from Nepal",
  description: "Seven Seas Intercontinental connects international employers with trained Nepali talent through transparent recruitment, candidate screening, practical skill assessment, training, and deployment support.",
  path: "/",
});

import { getContentRepository } from "@/repositories/content-resolver";
import { getPageCopy } from "@/services/page-copy.service";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const repo = getContentRepository();
  const headerNav = await repo.getNavigation("header");
  const footerSettings = await repo.getFooterSettings();
  const siteSettings = await repo.getSiteSettings();
  const layoutCopy = await getPageCopy("layout");
  const orgSchema = buildOrganizationSchema(siteSettings, footerSettings);
  const resourceLinks = headerNav
    .find((section) => section.label.toLowerCase() === "resources")
    ?.items.filter((item): item is typeof item & { href: string } => typeof item.href === "string")
    .map(({ label, href }) => ({ label, href })) || [];

  return (
    <html
      lang="en"
      className={`h-full antialiased ${publicFontVariables}`}
      data-scroll-behavior="smooth"
    >
      <body
        className="brand-headings min-h-full flex flex-col font-sans bg-brand-white text-brand-charcoal"
        suppressHydrationWarning
      >
        {orgSchema && (
          <Script id="organization-schema" type="application/ld+json" strategy="beforeInteractive">
            {JSON.stringify(orgSchema)}
          </Script>
        )}
        <GoogleTranslateScript />
        <FirstVisitLoader />
        <Header navigation={headerNav} copy={layoutCopy.header} />
        <main className="flex-1">{children}</main>
        <Footer footerSettings={footerSettings} siteSettings={siteSettings} resourceLinks={resourceLinks} copy={layoutCopy.footer} />
      </body>
    </html>
  );
}
