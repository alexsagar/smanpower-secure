import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlockRenderer } from "@/components/cms/ContentBlockRenderer";
import { GalleryInteractiveView } from "@/components/cms/blocks/GalleryInteractiveView";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPageBySlug, getPageSeo } from "@/repositories/content-resolver";
import { ShieldCheck, Award, Building2, Globe2, ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/gallery");
  return buildPageMetadata({
    title: seo?.metaTitle || "Operations & Facilities Gallery | Seven Seas Intercontinental",
    description:
      seo?.metaDescription ||
      "Explore Seven Seas Intercontinental's state-of-the-art trade testing labs, candidate orientation auditoriums, and provincial recruitment operations in Nepal.",
    path: "/gallery",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function GalleryPage() {
  const page = await getPageBySlug("gallery");
  const hasBlocks = page?.blocks && page.blocks.length > 0;

  return (
    <main className="min-h-screen bg-brand-off-white">
      {/* Light Editorial Gallery Hero */}
      <header className="relative border-b border-stone-200 bg-stone-100 px-6 py-20 lg:py-28 text-brand-charcoal overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

        <div className="container-wide relative z-10 mx-auto lg:px-12">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 border border-brand-gold/40 bg-brand-gold/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 mb-6">
            <ShieldCheck className="h-4 w-4 text-brand-gold" />
            <span>Verified Infrastructure & Operations</span>
          </div>

          <h1 className="text-4xl font-serif font-bold tracking-tight text-brand-charcoal md:text-6xl lg:text-7xl max-w-4xl leading-tight">
            {page?.title || "Operational Facilities & Media Gallery"}
          </h1>

          <p className="mt-6 text-lg text-stone-600 max-w-3xl leading-relaxed md:text-xl font-light">
            {page?.subtitle ||
              "Inspect our ISO-certified trade testing labs, orientation auditoriums, provincial sourcing centers, and verified candidate screening hubs across Nepal."}
          </p>
        </div>
      </header>

      {/* Render CMS Content Blocks or High-Level Interactive Gallery Component */}
      {hasBlocks ? (
        page.blocks.map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))
      ) : (
        <GalleryInteractiveView
          eyebrow="Inside Seven Seas"
          title="Operational Media Showcase"
          subtitle="Explore live photos and documentation from our training centers, trade test stations, and candidate deployment briefings."
          items={[]}
        />
      )}

      {/* Virtual Tour & Facility Audit Banner */}
      <section className="bg-stone-900 py-16 text-white border-t border-stone-800">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-slate-800/80 border border-stone-700 p-8 lg:p-12">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-brand-gold">
                <Building2 className="h-4 w-4" />
                Live Inspection Available
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white">
                Want to Inspect Our Facilities First-Hand?
              </h2>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed">
                We invite international employers, RBA auditors, and diplomatic delegations to schedule an in-person or live video tour of our Kathmandu testing labs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-brand-gold px-6 py-3.5 text-sm font-bold text-brand-black hover:bg-amber-400 transition-colors shadow-md"
              >
                <span>Schedule Virtual Tour</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/trust-centre"
                className="inline-flex items-center gap-2 border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
              >
                <Award className="h-4 w-4 text-brand-gold" />
                <span>View Compliance Documents</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
