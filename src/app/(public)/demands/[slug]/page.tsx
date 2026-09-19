import React from "react";
import { getPageCopy } from "@/services/page-copy.service";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ShieldAlert, Calendar, Users } from "lucide-react";
import { getDemandBySlug } from "@/repositories/content-resolver";
import { DemandCompanyStrip } from "@/components/demands/DemandCompanyStrip";
import { DemandPositionTable } from "@/components/demands/DemandPositionTable";
import { DemandPositionCards } from "@/components/demands/DemandPositionCards";
import { DemandDocumentViewer } from "@/components/demands/DemandDocumentViewer";
import { DemandStatusBadgeComponent } from "@/components/demands/DemandStatusBadge";
import { ReadvertisementBadge } from "@/components/demands/ReadvertisementBadge";
import { DemandLetterImage } from "@/components/demands/DemandLetterImage";

import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildJobPostingSchema, buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/schema";
import { getSiteUrl } from "@/lib/seo/site-config";
import { isDemandPubliclyViewable, isDemandIndexable, isDemandExpired } from "@/lib/demand-eligibility";
import { resolveMediaUrl } from "@/lib/media-resolver";
import { formatDemandDate, generateDemandSeo, toDateOnly } from "@/lib/demand-presentation";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const demand = await getDemandBySlug(slug);

  if (!demand || !isDemandPubliclyViewable(demand)) {
    notFound();
  }

  // Active public demands are indexable. Expired or closed demands remain accessible
  // as historical records with clear status, but emit noindex, follow to keep
  // search engine indexes clean of expired vacancies.
  const noIndex = !isDemandIndexable(demand);

  const generatedSeo = generateDemandSeo(demand);
  return buildPageMetadata({
    title: demand.seoTitle || generatedSeo.title,
    description: demand.metaDescription || generatedSeo.description,
    path: `/demands/${demand.slug}`,
    canonicalOverride: demand.canonicalUrl,
    ogImage: demand.ogImageUrl || (demand.featuredImage && resolveMediaUrl(demand.featuredImage)) || undefined,
    noIndex
  });
}

export default async function DemandDetailPage({ params }: Props) {
  const copy = await getPageCopy("demands/detail");
  const { slug } = await params;
  const demand = await getDemandBySlug(slug);

  // Draft, private, archived and soft-deleted demands are not publicly
  // accessible (real 404, never a homepage redirect). Invalid slugs 404 too.
  if (!demand || !isDemandPubliclyViewable(demand)) {
    notFound();
  }

  const hasDocuments = demand.documents && demand.documents.filter(d => d.visibility === "PUBLIC" && d.approvalStatus === "APPROVED").length > 0;

  const schemas = demand.positions
    .map((pos: any) => buildJobPostingSchema(demand, pos))
    .filter(Boolean);

  // BreadcrumbList + WebPage built from the SAME crumb labels rendered below.
  const siteUrl = getSiteUrl();
  const demandUrl = siteUrl ? `${siteUrl}/demands/${demand.slug}` : "";
  const structuralSchemas = siteUrl
    ? [
        buildBreadcrumbSchema([
          { name: copy.breadcrumbHome, url: siteUrl },
          { name: copy.breadcrumbDemands, url: `${siteUrl}/demands` },
          { name: demand.title, url: demandUrl },
        ]),
        buildWebPageSchema({ canonicalUrl: demandUrl, name: demand.title, description: demand.metaDescription }),
      ].filter(Boolean)
    : [];

  return (
    <div className="bg-brand-off-white min-h-screen relative font-sans">
      {(schemas.length > 0 || structuralSchemas.length > 0) && (
        <script id={`job-schema-${demand.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [...schemas, ...structuralSchemas]
          }).replace(/</g, "\\u003c") }} />
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
            <DemandLetterImage
              src={resolveMediaUrl(demand.featuredImage)}
              alt={`Demand letter for ${demand.title} in ${demand.country}`}
              width={demand.featuredImage.width}
              height={demand.featuredImage.height}
            />
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <DemandStatusBadgeComponent status={demand.statusBadge} />
                {demand.isReadvertisement && <ReadvertisementBadge />}
                {!demand.isPublic && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                    {copy.privateBadge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-brand-black tracking-tight leading-tight">
                {demand.title}
              </h1>

              {/* Real readvertisement relationship links (never fabricated). */}
              {demand.isReadvertisement && demand.readvertisedFrom && (
                <p className="text-sm text-brand-charcoal/80">
                  This demand is a readvertisement
                  {demand.readvertisedFrom.demandLotNumber
                    ? ` of Demand Lot ${demand.readvertisedFrom.demandLotNumber}`
                    : " of an earlier demand"}
                  .{" "}
                  <Link href={`/demands/${demand.readvertisedFrom.slug}`} className="text-brand-gold font-semibold hover:underline">
                    View the original demand
                  </Link>
                </p>
              )}
              {demand.currentReadvertisement && (
                <p className="text-sm text-brand-charcoal/80">
                  This demand has been readvertised.{" "}
                  <Link href={`/demands/${demand.currentReadvertisement.slug}`} className="text-brand-gold font-semibold hover:underline">
                    View the current demand
                  </Link>
                </p>
              )}
            </div>

            <div className="shrink-0 flex gap-4">
              <Link
                href="/demands"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-brand-charcoal/20 text-brand-charcoal hover:bg-brand-charcoal/5 transition-colors text-sm font-semibold uppercase tracking-wider bg-white shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> {copy.backLabel}
              </Link>
              {demand.canApply && (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-brand-charcoal/10 border border-brand-charcoal/10 mb-12" aria-label="Demand details">
          <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-brand-charcoal/60">Application Status</p><p className="font-semibold mt-1">{demand.applicationStatusLabel}</p></div>
          {demand.interviewDate && <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-brand-charcoal/60">Interview Date</p><p className="font-semibold mt-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-gold" /><time dateTime={toDateOnly(demand.interviewDate)}>{formatDemandDate(demand.interviewDate)}</time></p></div>}
          {demand.maleVacancies != null && demand.femaleVacancies != null && <>
            <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-brand-charcoal/60">Male Workers</p><p className="font-semibold mt-1 flex items-center gap-2"><Users className="w-4 h-4 text-brand-gold" />{demand.maleVacancies}</p></div>
            <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-brand-charcoal/60">Female Workers</p><p className="font-semibold mt-1 flex items-center gap-2"><Users className="w-4 h-4 text-brand-gold" />{demand.femaleVacancies}</p></div>
          </>}
          <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-brand-charcoal/60">Total Vacancies</p><p className="font-semibold mt-1">{demand.totalVacancies}</p></div>
          {demand.applicationDeadline && <div className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-brand-charcoal/60">Application Deadline</p><p className="font-semibold mt-1"><time dateTime={toDateOnly(demand.applicationDeadline)}>{formatDemandDate(demand.applicationDeadline)}</time></p></div>}
        </div>

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
              <p className="text-sm text-red-800 leading-relaxed">
                {demand.candidateSafetyNotice || "Seven Seas follows the Employer-Pays Principle. Candidates are not charged recruitment or placement fees, and all candidate costs are covered, including documentation and processing. Never pay anyone claiming to represent Seven Seas."}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
                <Link href="/ethical-recruitment/recruitment-fees" className="text-red-900 underline hover:text-red-700">
                  Fee Transparency Policy &rarr;
                </Link>
                <Link href="/worker-grievance" className="text-red-900 underline hover:text-red-700">
                  Report Fee Demand &rarr;
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4">
            <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">{copy.notices.feeHeading}</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                {demand.feeTransparencyNotice || "Seven Seas follows the Employer-Pays Principle. Candidates are not charged recruitment or placement fees, and all candidate costs are covered, including documentation and processing."}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
                <Link href="/ethical-recruitment/recruitment-fees" className="text-blue-900 underline hover:text-blue-700">
                  Zero-Fee Policy &rarr;
                </Link>
                <Link href="/worker-grievance" className="text-blue-900 underline hover:text-blue-700">
                  Worker Grievance Channel &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
