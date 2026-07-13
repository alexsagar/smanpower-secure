import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase } from "lucide-react";
import { getAdminCareerOpening, getAdminMediaAssets } from "@/services/admin.service";
import { CareerOpeningForm } from "@/components/admin/CareerOpeningForm";

export default async function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [assets, opening] = await Promise.all([getAdminMediaAssets(), getAdminCareerOpening(id)]);
  if (!opening) notFound();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Briefcase className="w-3 h-3" /> Module // Careers // Edit
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">Edit Career Opening</h1>
        </div>
        <Link href="/admin/careers" className="text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">Back to Careers</Link>
      </div>
      <div className="bg-white border border-brand-charcoal/10 p-8 shadow-sm">
        <CareerOpeningForm assets={assets} initialData={opening} />
      </div>
    </div>
  );
}
