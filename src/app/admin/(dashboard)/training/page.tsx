import { notFound } from "next/navigation";
import { getAdminFacilities } from "@/services/admin.service";
import Link from "next/link";
import { Plus, Edit2, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminTrainingPage() {
  notFound();
  const facilities = await getAdminFacilities();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block">
            Module // Training
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Training & Facilities
          </h1>
          <p className="text-brand-muted mt-2">
            Manage training infrastructure, programmes, and candidate orientation data.
          </p>
        </div>
        <div>
          <Link href="/admin/training/new" className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Facility
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Active Facilities</h2>
          <span className="text-xs text-brand-muted font-mono">{facilities.length} Entries</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Facility Name</th>
                <th className="p-6 font-medium">Description</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {facilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors">{facility.name}</div>
                    <div className="text-xs text-brand-muted font-mono mt-1">{facility.slug}</div>
                  </td>
                  <td className="p-6 text-sm text-brand-charcoal">
                    {facility.description}
                  </td>
                  <td className="p-6">
                    {facility.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button disabled className="text-brand-muted/50 cursor-not-allowed" title="Editing training facilities is currently disabled">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
