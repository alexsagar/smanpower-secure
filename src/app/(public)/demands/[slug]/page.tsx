import React from "react";
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
    <div className="bg-brand-gray/30 min-h-screen">
      {schemas.length > 0 && (
        <Script id={`job-schema-${demand.id}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": schemas
          })}
        </Script>
      )}
      {/* Page Header */}
      <div className="bg-brand-black text-brand-white pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm text-brand-white/60 mb-6 font-mono">
            <Link href="/" className="hover:text-brand-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/demands" className="hover:text-brand-white transition-colors">Demands</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-brand-white/90 truncate max-w-xs">{demand.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-4">
                <DemandStatusBadgeComponent status={demand.statusBadge} />
                {!demand.isPublic && (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                    Draft / Private
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4">
                {demand.title}
              </h1>
            </div>
            
            <div className="shrink-0 flex gap-4">
              <Link
                href="/demands"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-brand-white/20 text-brand-white hover:bg-brand-white/5 transition-colors text-sm font-semibold uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" /> Back to List
              </Link>
              {process.env.PUBLIC_APPLICATIONS_ENABLED === 'true' && demand.enableApplication && !isClosed && (
                <Link
                  href={`/demands/${demand.slug}/apply`}
                  className="flex items-center justify-center bg-brand-gold text-brand-black px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-brand-white transition-colors"
                >
                  Apply Job
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal mb-2">Demand Notice</h3>
            <p className="text-brand-charcoal whitespace-pre-line">{demand.generalNotes}</p>
          </div>
        )}

        {/* Vacancies Section */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-serif text-brand-black">Available Positions</h2>
              <p className="text-brand-charcoal/70 mt-1">Review the details and salary information for each vacancy.</p>
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
              <h2 className="text-2xl font-bold font-serif text-brand-black">Official Documents</h2>
              <p className="text-brand-charcoal/70 mt-1">Verified demand letters and approval documents.</p>
            </div>
            
            <DemandDocumentViewer documents={demand.documents} />
          </div>
        )}

        {/* Safety & Fee Transparency Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 pt-16 border-t border-brand-charcoal/10">
          <div className="bg-red-50 border border-red-100 p-6 rounded-sm flex gap-4">
            <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Candidate Safety Notice</h3>
              <p className="text-sm text-red-800">
                {demand.candidateSafetyNotice || "Do not make any payment to individuals claiming to represent Seven Seas Intercontinental. Only pay official service fees at our main office and always demand a computer-generated receipt."}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4">
            <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Fee Transparency</h3>
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
