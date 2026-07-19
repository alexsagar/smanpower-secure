import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { getSafeExternalHttpUrl, sanitizeHtml } from "@/lib/html-safety";
import { prisma } from "@/lib/prisma";
import { CareerApplyForm } from "./CareerApplyForm";

async function getCareer(slug: string) {
  return prisma.careerOpening.findFirst({
    where: { slug, lang: "en", status: "OPEN", deletedAt: null },
    include: { featuredImage: true },
  });
}

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
  const { slug } = await params;
  const opening = await getCareer(slug);
  if (!opening) notFound();
  const safeApplicationUrl = getSafeExternalHttpUrl(opening.applicationUrl);

  return (
    <>
      <HeroInternal title={opening.title} subtitle={opening.department || "Career Opening"} imageSrc={opening.featuredImage?.fileUrl || "/images/corporate_office_interview_1782920412325.png"} />
      <section className="py-24 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12 max-w-4xl space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div><span className="block text-xs uppercase tracking-widest text-brand-muted mb-2">Department</span><span className="font-medium text-brand-black">{opening.department || "-"}</span></div>
            <div><span className="block text-xs uppercase tracking-widest text-brand-muted mb-2">Location</span><span className="font-medium text-brand-black">{opening.location || "-"}</span></div>
            <div><span className="block text-xs uppercase tracking-widest text-brand-muted mb-2">Employment Type</span><span className="font-medium text-brand-black">{opening.employmentType || "-"}</span></div>
          </div>
          <div className="prose prose-lg max-w-none text-brand-black/80">
            <h2>Description</h2>
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(opening.description) }} />
            {opening.requirements && (
              <>
                <h2>Requirements</h2>
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(opening.requirements) }} />
              </>
            )}
            {opening.responsibilities && (
              <>
                <h2>Responsibilities</h2>
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
                  Apply Now
                </Link>
              ) : opening.applicationEmail ? (
                <a href={`mailto:${opening.applicationEmail}`} className="inline-flex items-center gap-4 bg-brand-black text-brand-white px-10 py-5 hover:bg-brand-gold hover:text-brand-black transition-colors duration-300 text-sm font-semibold tracking-widest uppercase">
                  Apply by Email
                </a>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
