import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleTranslateScript } from "@/components/layout/GoogleTranslateScript";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const repo = getContentRepository();
  const headerNav = await repo.getNavigation("header");
  const footerSettings = await repo.getFooterSettings();
  const siteSettings = await repo.getSiteSettings();
  const orgSchema = buildOrganizationSchema();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans bg-brand-white text-brand-charcoal">
        {orgSchema && (
          <Script id="organization-schema" type="application/ld+json" strategy="beforeInteractive">
            {JSON.stringify(orgSchema)}
          </Script>
        )}
        <GoogleTranslateScript />
        <Header navigation={headerNav} />
        <main className="flex-1">{children}</main>
        <Footer footerSettings={footerSettings} siteSettings={siteSettings} />
      </body>
    </html>
  );
}
