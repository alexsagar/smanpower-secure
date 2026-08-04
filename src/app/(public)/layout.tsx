import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleTranslateScript } from "@/components/layout/GoogleTranslateScript";
import { FirstVisitLoader } from "@/components/loading/FirstVisitLoader";
import { publicFontVariables } from "@/lib/fonts";
import "@/app/globals.css";

import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/schema";
import { Metadata } from "next";

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
  const webSiteSchema = buildWebSiteSchema(siteSettings);
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
          // Plain server-rendered script tag: next/script beforeInteractive did
          // not emit the JSON-LD into the initial App Router HTML, so the
          // Organization entity was absent from raw page source (crawlers see
          // this, not the hydrated DOM).
          <script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(orgSchema).replace(/</g, "\\u003c"),
            }}
          />
        )}
        {webSiteSchema && (
          <script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(webSiteSchema).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <GoogleTranslateScript />
        <FirstVisitLoader />
        <Header navigation={headerNav} copy={layoutCopy.header} />
        {/* min-h-screen is load-bearing, not cosmetic: page bodies stream in via
            Suspense, so the shell flushes with `main` nearly empty and the footer
            lands mid-viewport. When the real sections arrive `main` jumps to
            ~13,000px and the visible footer is shoved down — a single 0.42 layout
            shift, which was the entire CLS score. Reserving a viewport of height
            keeps the footer below the fold until the content settles. */}
        <main className="flex-1 min-h-screen">{children}</main>
        <Footer footerSettings={footerSettings} siteSettings={siteSettings} resourceLinks={resourceLinks} copy={layoutCopy.footer} />
      </body>
    </html>
  );
}
