import { toPublicHref } from "@/lib/public-href";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Briefcase } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Careers | Seven Seas Intercontinental",
    description: "Current internal career openings at Seven Seas Intercontinental.",
    path: "/careers",
  });
}

export default async function CareersPage() {
  const openings = await prisma.careerOpening.findMany({
    where: { status: "OPEN", deletedAt: null, lang: "en" },
    include: { featuredImage: true },
    orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <>
      <HeroInternal title="Careers." subtitle="Join Our Team" imageSrc="/images/corporate_office_interview_1782920412325.png" />
      <section className="py-24 md:py-32 bg-brand-off-white">
        <div className="container-wide mx-auto px-6 lg:px-12">
          {openings.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-3xl font-semibold text-brand-black mb-4">No current openings.</h2>
              <p className="text-brand-muted">Please check back later or contact us.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {openings.map((opening) => (
                <Link key={opening.id} href={toPublicHref(`/careers/${opening.slug}`)} className="group block bg-white border border-brand-charcoal/10 p-8 hover:border-brand-gold hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4 text-[10px] font-semibold tracking-widest uppercase text-brand-muted mb-6">
                    <span className="bg-brand-charcoal/5 px-3 py-1 rounded-full">{opening.department || "Careers"}</span>
                    <span className="bg-brand-charcoal/5 px-3 py-1 rounded-full">{opening.employmentType || "Role"}</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-brand-black mb-3 group-hover:text-brand-gold transition-colors">{opening.title}</h2>
                  <p className="text-sm font-medium text-brand-charcoal/60 mb-6 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> {opening.location || "Location to be confirmed"}
                  </p>
                  <p className="text-brand-muted leading-relaxed mb-8 line-clamp-4">{opening.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-brand-charcoal group-hover:text-brand-gold transition-colors">
                    View Opening <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
