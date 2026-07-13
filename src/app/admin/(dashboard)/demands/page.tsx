import React from "react";
import Link from "next/link";
import { Plus, Search, Edit, ExternalLink } from "lucide-react";
import { getAdminDemands } from "@/services/demand.service";
import { DemandActions } from "@/components/admin/demands/DemandActions";

export const metadata = {
  title: "Manage Demands | Admin",
};

export default async function AdminDemandsPage() {
  const demands = await getAdminDemands();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black font-serif">Manage Demands</h1>
          <p className="text-sm text-brand-charcoal/70">View and manage international manpower demands.</p>
        </div>
        <Link
          href="/admin/demands/new"
          className="flex items-center gap-2 bg-brand-black text-brand-white px-4 py-2 font-bold uppercase tracking-wider text-sm hover:bg-brand-gold hover:text-brand-black transition-colors"
        >
          <Plus className="w-4 h-4" /> New Demand
        </Link>
      </div>

      <div className="bg-white border border-brand-charcoal/10 rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-brand-charcoal/10 flex flex-wrap gap-4 items-center justify-between bg-brand-charcoal/5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40" />
            <input
              type="text"
              placeholder="Search demands..."
              className="w-full pl-9 pr-4 py-2 border-brand-charcoal/20 rounded-sm text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="border-brand-charcoal/20 rounded-sm text-sm py-2">
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider bg-brand-charcoal/5 text-brand-charcoal">
              <tr>
                <th className="px-6 py-4 font-semibold">Demand / Company</th>
                <th className="px-6 py-4 font-semibold text-center">Positions</th>
                <th className="px-6 py-4 font-semibold text-center">Applications</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/10">
              {demands.map((demand) => (
                <tr key={demand.id} className="hover:bg-brand-charcoal/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black mb-1">{demand.title}</div>
                    <div className="text-brand-charcoal/70 text-xs flex items-center gap-2">
                      <span className="font-semibold">{demand.companyName}</span>
                      <span>•</span>
                      <span>{demand.country as string}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {demand._count?.positions || 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-brand-charcoal/10 px-2 py-1 rounded-sm text-xs font-bold">
                      {demand._count?.applications || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        demand.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                        demand.status === "CLOSED" ? "bg-red-100 text-red-800" :
                        "bg-brand-charcoal/10 text-brand-charcoal"
                      }`}>
                        {demand.status}
                      </span>
                      {!demand.isPublic && (
                        <span className="text-[10px] font-bold text-brand-charcoal/50 uppercase">Private</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/demands/${demand.id}/edit`}
                        className="p-2 text-brand-charcoal hover:bg-brand-gold hover:text-brand-black rounded-sm transition-colors"
                        title="Edit Demand"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DemandActions demandId={demand.id} status={demand.status} title={demand.title} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {demands.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-brand-charcoal/50">
                    No demands found.
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
