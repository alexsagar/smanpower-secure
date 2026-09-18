import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleTranslateScript } from "@/components/layout/GoogleTranslateScript";
import { publicFontVariables } from "@/lib/fonts";
import "@/app/globals.css";
import { getFooterSettings, getNavigation, getSiteSettings } from "@/repositories/content-resolver";
import { getPageCopy } from "@/services/page-copy.service";

export const metadata: Metadata = {
  title: "Page Not Found | Seven Seas Intercontinental",
  description: "The page you're looking for may have moved or is no longer available.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: null,
  },
};

export default async function NotFound() {
  const [headerNav, footerSettings, siteSettings] = await Promise.all([
    getNavigation("header"),
    getFooterSettings(),
    getSiteSettings(),
  ]);
  const layoutCopy = await getPageCopy("layout");
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
        <GoogleTranslateScript />
        <Header navigation={headerNav} copy={layoutCopy.header} />
        <main className="flex-1 flex items-center justify-center pt-36 pb-24 sm:pt-40 sm:pb-32 px-6 sm:px-8 lg:px-12 bg-brand-white">
          <div className="max-w-xl mx-auto text-center">
            <p className="font-heading font-medium text-7xl sm:text-8xl md:text-9xl tracking-tight text-brand-gold select-none">
              404
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-brand-black">
              Page not found
            </h1>
            <p className="mt-4 text-base sm:text-lg text-brand-muted max-w-md mx-auto leading-relaxed">
              The page you&apos;re looking for may have moved or is no longer available.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 text-sm font-medium bg-brand-black text-white hover:bg-brand-charcoal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
              >
                Back to homepage
              </Link>
              <Link
                href="/demands"
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 text-sm font-medium border border-brand-charcoal/20 bg-transparent text-brand-charcoal hover:bg-brand-stone transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
              >
                View job opportunities
              </Link>
            </div>
          </div>
        </main>
        <Footer
          footerSettings={footerSettings}
          siteSettings={siteSettings}
          resourceLinks={resourceLinks}
          copy={layoutCopy.footer}
        />
      </body>
    </html>
  );
}
