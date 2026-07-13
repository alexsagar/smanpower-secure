import React from "react";
import { Metadata } from "next";
import { getPublishedDemands, getDemandFilterOptions } from "@/repositories/content-resolver";
import { DemandCard } from "@/components/demands/DemandCard";
import { DemandFilters } from "@/components/demands/DemandFilters";
import { CmsDemandFilters } from "@/types/content";

import { buildPageMetadata } from "@/lib/seo/metadata";

import { getPageSeo } from "@/repositories/content-resolver";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const seo = await getPageSeo("/demands", lang);
  return buildPageMetadata({
    title: seo?.metaTitle || "Foreign Job Demands in Nepal | Overseas Employment Opportunities",
    description: seo?.metaDescription || "Browse published foreign job demands for Nepali workers. View position details, application instructions, fee-transparency notices, and worker-safety guidance.",
    path: "/demands",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export default async function DemandsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;

  const filters: CmsDemandFilters = {
    country: resolvedSearchParams.country,
    industry: resolvedSearchParams.industry,
    company: resolvedSearchParams.company,
    status: resolvedSearchParams.status as any,
  };

  const demands = await getPublishedDemands(filters);
  const filterOptions = await getDemandFilterOptions();

  return (
    <div className="bg-brand-off-white min-h-screen relative overflow-hidden font-sans">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 pt-32 pb-16 border-b border-brand-charcoal/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-brand-charcoal/10 shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal">Global Opportunities</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-[1.1] text-brand-black mb-6">
            Foreign Job Demands <br />
            <span className="font-serif italic text-brand-gold">in Nepal.</span>
          </h1>
          <p className="text-brand-charcoal/60 max-w-2xl text-lg font-light leading-relaxed">
            Browse published foreign job demands shared by Seven Seas Intercontinental. Each demand includes position details, transparent fee structures, and worker-safety guidance for official applications.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4 shrink-0">
            <React.Suspense fallback={<div className="p-6 bg-white border border-brand-charcoal/10 rounded-sm">Loading filters...</div>}>
              <DemandFilters options={filterOptions} className="sticky top-24" />
            </React.Suspense>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {demands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {demands.map((demand) => (
                  <DemandCard key={demand.id} demand={demand} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 p-16 text-center rounded-2xl shadow-sm">
                <div className="w-16 h-16 mx-auto bg-brand-off-white border border-brand-charcoal/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-brand-gold text-2xl">?</span>
                </div>
                <h3 className="text-2xl font-light tracking-tight text-brand-black mb-3">
                  No Demands Found
                </h3>
                <p className="text-brand-charcoal/60 font-light">
                  We couldn't find any demands matching your current filters. Please try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
