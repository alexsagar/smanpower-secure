import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { destinationsContent } from "@/lib/content";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import { DemandCard } from "@/components/demands/DemandCard";
import { getPublishedDemands } from "@/repositories/content-resolver";

export const revalidate = 86400;

/**
 * Slug → the `Country.name` used by the demand filter.
 *
 * Only individual countries appear here. `europe` is deliberately absent: it is
 * a regional page, not a country, and there is no single `Country` record it
 * could filter demands by. A slug with no entry simply renders no demand
 * preview, which is also the correct behaviour for a country that currently has
 * no published demands.
 */
const COUNTRY_NAME: Record<string, string> = {
  "saudi-arabia": "Saudi Arabia",
  "united-arab-emirates": "United Arab Emirates",
  qatar: "Qatar",
  oman: "Oman",
  bahrain: "Bahrain",
  kuwait: "Kuwait",
  malaysia: "Malaysia",
  japan: "Japan",
};

export function generateStaticParams() {
  return destinationsContent.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildDynamicPageMetadata("destinations", slug);
}

/**
 * Published demands for this destination, rendered only when some exist.
 * `/demands` remains the canonical listing URL — this is a contextual preview
 * that links back to the filtered listing, not a second listing page.
 */
async function CountryDemands({ country }: { country: string }) {
  const demands = await getPublishedDemands({ country }).catch(() => []);
  if (!demands || demands.length === 0) return null;

  const preview = demands.slice(0, 3);

  return (
    <section className="py-24 lg:py-32 bg-brand-off-white text-brand-black border-t border-brand-charcoal/10">
      <div className="container-wide mx-auto px-6 lg:px-12">
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
            Open Demands
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-4">
            Currently Published for {country}.
          </h2>
          <p className="text-brand-muted font-light">
            Candidates should apply only through the official demand listing. No recruitment,
            placement or processing fee is ever charged to a candidate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {preview.map((demand) => (
            <DemandCard key={demand.id} demand={demand} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/demands?country=${encodeURIComponent(country)}`}
            className="inline-flex items-center gap-3 border border-brand-black px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-brand-black hover:text-brand-white transition-colors"
          >
            <span>View all demands for {country}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("destinations", slug);

  if (!content) notFound();

  const country = COUNTRY_NAME[slug];

  return (
    <DynamicPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Recruitment by Destination", path: "/destinations" },
        { name: content.subtitle || content.title, path: `/destinations/${slug}` },
      ]}
      extraSection={country ? <CountryDemands country={country} /> : null}
    />
  );
}
