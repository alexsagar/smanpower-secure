import React from "react";
import { getPageCopy } from "@/services/page-copy.service";
import Image from "next/image";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ShieldAlert } from "lucide-react";
import { getDemandBySlug } from "@/repositories/content-resolver";
import { DemandCompanyStrip } from "@/components/demands/DemandCompanyStrip";
import { DemandPositionTable } from "@/components/demands/DemandPositionTable";
import { DemandPositionCards } from "@/components/demands/DemandPositionCards";
import { DemandDocumentViewer } from "@/components/demands/DemandDocumentViewer";
import { DemandStatusBadgeComponent } from "@/components/demands/DemandStatusBadge";

import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildJobPostingSchema } from "@/lib/seo/schema";
import { resolveMediaUrl } from "@/lib/media-resolver";
import Script from "next/script";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const demand = await getDemandBySlug(slug);

  if (!demand) {
    return buildPageMetadata({
      title: "Demand Not Found",
      path: `/demands/${slug}`,
      noIndex: true
    });
  }

  // If not public or draft, noindex
  const noIndex = !demand.isPublic || demand.status !== "PUBLISHED";

  return buildPageMetadata({
    title: demand.seoTitle || demand.title,
    description: demand.metaDescription || `Official demand from ${demand.companyName} for manpower recruitment in ${demand.country}.`,
    path: `/demands/${demand.slug}`,
    canonicalOverride: demand.canonicalUrl,
    ogImage: demand.ogImageUrl,
    noIndex
  });
}

export default async function DemandDetailPage({ params }: Props) {
  const copy = await getPageCopy("demands/detail");
  const { slug } = await params;
  const demand = await getDemandBySlug(slug);

  if (!demand) {
    notFound();
  }

  const isClosed = demand.status === "CLOSED" || demand.status === "ARCHIVED";
  const hasDocuments = demand.documents && demand.documents.filter(d => d.visibility === "PUBLIC" && d.approvalStatus === "APPROVED").length > 0;

  const schemas = demand.positions
    .map((pos: any) => buildJobPostingSchema(demand, pos))
    .filter(Boolean);

  return (
    <div className="bg-brand-off-white min-h-screen relative font-sans">
      {schemas.length > 0 && (
        <Script id={`job-schema-${demand.id}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": schemas
          })}
        </Script>
      )}      {/* Page Header */}
      <div className="relative pt-32 pb-8 border-b border-brand-charcoal/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-brand-charcoal/60 mb-6 font-mono">
            <Link href="/" className="hover:text-brand-gold transition-colors">{copy.breadcrumbHome}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/demands" className="hover:text-brand-gold transition-colors">{copy.breadcrumbDemands}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-brand-charcoal/90 truncate max-w-xs">{demand.title}</span>
          </div>
          {/* Featured image is optional: when absent nothing renders, no placeholder. */}
          {demand.featuredImage && (
            <div className="relative w-full aspect-[21/9] mb-8 overflow-hidden rounded-sm bg-brand-charcoal/5 border border-brand-charcoal/10 shadow-sm">
              <Image
                src={resolveMediaUrl(demand.featuredImage)}
                alt={demand.featuredImage.altText || demand.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-4">
                <DemandStatusBadgeComponent status={demand.statusBadge} />
                {!demand.isPublic && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                    {copy.privateBadge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-brand-black tracking-tight leading-tight">
                {demand.title}
              </h1>
            </div>

            <div className="shrink-0 flex gap-4">
              <Link
                href="/demands"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-brand-charcoal/20 text-brand-charcoal hover:bg-brand-charcoal/5 transition-colors text-sm font-semibold uppercase tracking-wider bg-white shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> {copy.backLabel}
              </Link>
              {process.env.PUBLIC_APPLICATIONS_ENABLED === 'true' && demand.enableApplication && !isClosed && (
                <Link
                  href={`/demands/${demand.slug}/apply`}
                  className="flex items-center justify-center bg-brand-gold text-brand-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-brand-gold/90 transition-colors shadow-sm"
                >
                  {copy.applyLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <DemandCompanyStrip demand={demand} />

        {demand.generalNotes && (
          <div className="bg-brand-charcoal/5 border border-brand-charcoal/10 p-6 rounded-sm mb-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal mb-2">{copy.noticeHeading}</h3>
            <p className="text-brand-charcoal whitespace-pre-line">{demand.generalNotes}</p>
          </div>
        )}

        {/* Vacancies Section */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-serif text-brand-black">{copy.positions.heading}</h2>
              <p className="text-brand-charcoal/70 mt-1">{copy.positions.subtitle}</p>
            </div>
          </div>

          <div className="hidden lg:block">
            <DemandPositionTable demand={demand} lang="en" />
          </div>
          <div className="block lg:hidden">
            <DemandPositionCards demand={demand} lang="en" />
          </div>

          <p className="text-xs text-brand-charcoal/50 mt-4 max-w-3xl">
            * NPR equivalents are estimates based on the exchange rate at the time of demand approval and may vary. Final salary is based on the local currency amount specified in the employment contract.
          </p>
        </div>

        {/* Official Documents Section */}
        {hasDocuments && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-serif text-brand-black">{copy.documents.heading}</h2>
              <p className="text-brand-charcoal/70 mt-1">{copy.documents.subtitle}</p>
            </div>

            <DemandDocumentViewer documents={demand.documents} />
          </div>
        )}

        {/* Safety & Fee Transparency Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 pt-16 border-t border-brand-charcoal/10">
          <div className="bg-red-50 border border-red-100 p-6 rounded-sm flex gap-4">
            <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">{copy.notices.safetyHeading}</h3>
              <p className="text-sm text-red-800">
                {demand.candidateSafetyNotice || "Do not make any payment to individuals claiming to represent Seven Seas Intercontinental. Only pay official service fees at our main office and always demand a computer-generated receipt."}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4">
            <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">{copy.notices.feeHeading}</h3>
              <p className="text-sm text-blue-800">
                {demand.feeTransparencyNotice || "Seven Seas Intercontinental operates in strict compliance with the Government of Nepal's foreign employment guidelines regarding service fees and costs."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
