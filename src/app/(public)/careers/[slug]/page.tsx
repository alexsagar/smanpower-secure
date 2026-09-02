import { notFound } from "next/navigation";
import { getPageCopy } from "@/services/page-copy.service";
import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { getSafeExternalHttpUrl, sanitizeHtml } from "@/lib/html-safety";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_REVALIDATE, CACHE_TAGS } from "@/lib/cache-tags";
import { resolveMediaUrl, MEDIA_PLACEHOLDER } from "@/lib/media-resolver";
import { CareerApplyForm } from "./CareerApplyForm";


export const revalidate = 3600;

const getCareer = unstable_cache(
  (slug: string) => prisma.careerOpening.findFirst({
    where: { slug, lang: "en", status: "OPEN", deletedAt: null },
    include: { featuredImage: true },
  }), ["published-career"],
  { revalidate: CACHE_REVALIDATE.careers, tags: [CACHE_TAGS.careers] }
);


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const opening = await getCareer(slug);
  if (!opening) return buildPageMetadata({ title: "Not Found", path: "" });
  return buildPageMetadata({
    title: opening.metaTitle || opening.title,
    description: opening.metaDescription || opening.description.slice(0, 160),
    path: `/careers/${slug}`,
    noIndex: opening.noIndex || false,
  });
}

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const copy = await getPageCopy("careers/detail");
  const { slug } = await params;
  const opening = await getCareer(slug);
  if (!opening) notFound();
  const safeApplicationUrl = getSafeExternalHttpUrl(opening.applicationUrl);
  // Provider-aware: an R2 featuredImage delivers from media.smanpower.com, not
  // its legacy Cloudinary fileUrl.
  const featuredSrc = opening.featuredImage ? resolveMediaUrl(opening.featuredImage) : undefined;

  return (
    <>
      <HeroInternal title={opening.title} subtitle={opening.department || "Career Opening"} imageSrc={featuredSrc && featuredSrc !== MEDIA_PLACEHOLDER ? featuredSrc : "/images/corporate_office_interview_1782920412325.png"} />
      <section className="py-24 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12 max-w-4xl space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div><span className="block text-xs uppercase tracking-widest text-brand-muted mb-2">{copy.departmentLabel}</span><span className="font-medium text-brand-black">{opening.department || "-"}</span></div>
            <div><span className="block text-xs uppercase tracking-widest text-brand-muted mb-2">{copy.locationLabel}</span><span className="font-medium text-brand-black">{opening.location || "-"}</span></div>
            <div><span className="block text-xs uppercase tracking-widest text-brand-muted mb-2">{copy.employmentTypeLabel}</span><span className="font-medium text-brand-black">{opening.employmentType || "-"}</span></div>
          </div>
          <div className="prose prose-lg max-w-none text-brand-black/80">
            <h2>{copy.descriptionHeading}</h2>
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(opening.description) }} />
            {opening.requirements && (
              <>
                <h2>{copy.requirementsHeading}</h2>
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(opening.requirements) }} />
              </>
            )}
            {opening.responsibilities && (
              <>
                <h2>{copy.responsibilitiesHeading}</h2>
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(opening.responsibilities) }} />
              </>
            )}
          </div>
          
          {!safeApplicationUrl && !opening.applicationEmail ? (
            <div id="apply" className="pt-8 border-t border-brand-charcoal/10">
              <CareerApplyForm careerOpeningId={opening.id} />
            </div>
          ) : (
            <div className="pt-8 border-t border-brand-charcoal/10">
              {safeApplicationUrl ? (
                <Link href={safeApplicationUrl} className="inline-flex items-center gap-4 bg-brand-black text-brand-white px-10 py-5 hover:bg-brand-gold hover:text-brand-black transition-colors duration-300 text-sm font-semibold tracking-widest uppercase">
                  {copy.applyNowLabel}
                </Link>
              ) : opening.applicationEmail ? (
                <a href={`mailto:${opening.applicationEmail}`} className="inline-flex items-center gap-4 bg-brand-black text-brand-white px-10 py-5 hover:bg-brand-gold hover:text-brand-black transition-colors duration-300 text-sm font-semibold tracking-widest uppercase">
                  {copy.applyByEmailLabel}
                </a>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
