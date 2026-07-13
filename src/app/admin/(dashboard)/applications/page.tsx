import { getAdminApplications } from "@/services/admin.service";
import Link from "next/link";
import { Search, Filter, Eye, AlertTriangle } from "lucide-react";

export default async function AdminApplicationsPage() {
  const applications = await getAdminApplications();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block">
            Module // Recruitment
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Application Processing
          </h1>
          <p className="text-brand-muted mt-2">
            Review and process incoming candidate applications.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Applications Inbox</h2>
          <span className="text-xs text-brand-muted font-mono">{applications.length} Applications</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Candidate</th>
                <th className="p-6 font-medium">Applied Demand & Position</th>
                <th className="p-6 font-medium">Submission Date</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {applications.length > 0 ? applications.map((app) => (
                <tr key={app.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors">
                      {app.candidate?.fullName || "Unknown"}
                    </div>
                    {app.possibleDuplicate && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold tracking-widest uppercase mt-1">
                        <AlertTriangle className="w-3 h-3" /> Possible Duplicate
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-semibold text-brand-black">{app.demandTitle}</div>
                    <div className="text-xs text-brand-muted mt-1">{app.positionName}</div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-mono text-brand-charcoal">
                      {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                      app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <Link href={`/admin/applications/${app.id}`} className="text-brand-muted hover:text-brand-black transition-colors" title="View Application">
                      <Eye className="w-4 h-4 inline-block" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-muted">
                    No applications found.
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
