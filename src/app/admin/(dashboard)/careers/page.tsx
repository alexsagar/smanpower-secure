import Link from "next/link";
import { Briefcase, Edit2, Plus, Users } from "lucide-react";
import { getAdminCareerOpenings } from "@/services/admin.service";
import { DeleteCareerButton } from "./DeleteCareerButton";

export default async function AdminCareersPage() {
  const careers = await getAdminCareerOpenings();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Briefcase className="w-3 h-3" /> Module // Careers
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">Careers</h1>
          <p className="text-brand-muted mt-2">Manage internal career openings without using the legacy jobs module.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/careers/applications" className="bg-white border border-brand-charcoal/20 text-brand-charcoal px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-charcoal hover:text-white transition-colors flex items-center gap-2">
            <Users className="w-4 h-4" />
            View Applications
          </Link>
          <Link href="/admin/careers/new" className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Career
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Career Openings</h2>
          <span className="text-xs text-brand-muted font-mono">{careers.length} Entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-off-white border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Title</th>
                <th className="p-6 font-medium">Language</th>
                <th className="p-6 font-medium">Department</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium">Deadline</th>
                <th className="p-6 font-medium">Updated</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {careers.map((career) => (
                <tr key={career.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6 max-w-sm">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors line-clamp-1">{career.title}</div>
                    <div className="text-xs text-brand-muted font-mono mt-1">/{career.slug}</div>
                  </td>
                  <td className="p-6 text-xs text-brand-muted uppercase">{career.lang}</td>
                  <td className="p-6 text-xs text-brand-muted">{career.department || "-"}</td>
                  <td className="p-6 text-xs text-brand-muted uppercase">{career.status}</td>
                  <td className="p-6 text-xs text-brand-muted">{career.deadline ? new Date(career.deadline).toLocaleDateString() : "-"}</td>
                  <td className="p-6 text-xs text-brand-muted">{new Date(career.updatedAt).toLocaleDateString()}</td>
                  <td className="p-6 text-right">
                    <Link href={`/admin/careers/${career.id}`} className="text-brand-muted hover:text-brand-gold transition-colors">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </Link>
                    <DeleteCareerButton id={career.id} />
                  </td>
                </tr>
              ))}
              {careers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-brand-muted">No career openings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
