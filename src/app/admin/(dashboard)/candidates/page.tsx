import { notFound } from "next/navigation";
import { getAdminCandidates } from "@/services/admin.service";
import Link from "next/link";
import { Plus, Edit2, UserCheck, FileText } from "lucide-react";

export default async function AdminCandidatesPage() {
  notFound();
  const candidates = await getAdminCandidates();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block">
            Module // Recruitment
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Candidate Profiles
          </h1>
          <p className="text-brand-muted mt-2">
            Manage the global workforce pool and track active applications.
          </p>
        </div>
        <div>
          <button disabled className="bg-brand-black/50 text-brand-white/50 px-6 py-3 text-sm font-semibold tracking-widest uppercase cursor-not-allowed flex items-center gap-2" title="Candidates apply via public portal. Manual addition is disabled.">
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Candidate Pool</h2>
          <span className="text-xs text-brand-muted font-mono">{candidates.length} Profiles</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Full Name</th>
                <th className="p-6 font-medium">Contact</th>
                <th className="p-6 font-medium">Skill Category</th>
                <th className="p-6 font-medium">Active Apps</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {candidates.length > 0 ? candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-brand-gold" />
                      {candidate.fullName}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm text-brand-charcoal">{candidate.email}</div>
                    <div className="text-xs text-brand-muted font-mono mt-1">{candidate.phone}</div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-brand-charcoal/5 text-brand-charcoal">
                      {candidate.skillCategory || "Uncategorized"}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                      <FileText className="w-3.5 h-3.5" /> {(candidate as any).applications?.length || 0}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button disabled className="text-brand-muted/50 cursor-not-allowed" title="Candidate profile editing is currently disabled">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-muted">
                    No candidates found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
