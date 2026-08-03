import { notFound } from "next/navigation";
import { getPageCopy } from "@/services/page-copy.service";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDemandBySlug } from "@/repositories/content-resolver";
import { DemandApplyForm } from "./DemandApplyForm";

interface ApplyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const copy = await getPageCopy("demands/detail");
  const { slug } = await params;
  const demand = await getDemandBySlug(slug);

  if (!demand) {
    notFound();
  }

  if (!demand.canApply) {
    notFound();
  }

  const openPositions = demand.positions.filter(
    (position) => position.status !== "CLOSED" && position.status !== "FILLED"
  );

  if (openPositions.length === 0) {
    notFound();
  }

  const demandForApply = {
    ...demand,
    positions: openPositions,
  };

  return (
    <div className="bg-brand-off-white min-h-screen pt-[calc(var(--site-header-height)+env(safe-area-inset-top))]">
      <div className="border-b border-brand-charcoal/10 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <Link
            href={`/demands/${demand.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-charcoal/70 hover:text-brand-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {copy.applyPage.backLabel}
          </Link>
          <div className="mt-6">
            <p className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-3">
              {copy.applyPage.heading}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-brand-black">
              Apply for {demand.title}
            </h1>
            <p className="text-brand-charcoal/70 mt-3 max-w-2xl">
              Submit your application for {demand.companyName}. Your documents are stored privately and reviewed by authorized recruitment staff only.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <DemandApplyForm demand={demandForApply} />
      </div>
    </div>
  );
}
