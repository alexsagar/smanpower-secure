"use client";

import React from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { DemandActions } from "@/components/admin/demands/DemandActions";
import {
  DemandListToolbar,
  useDemandListFilter,
  type DemandListRow,
} from "@/components/admin/demands/DemandListFilters";

type DemandRow = DemandListRow & {
  isPublic: boolean;
  demandReferenceNumber?: string | null;
  _count?: { positions?: number; applications?: number };
};

/**
 * Demand list table with working search and status filter.
 *
 * Markup is unchanged from the previous server-rendered table; only the rows it
 * receives are filtered, in the browser, from the already fetched list.
 */
export function DemandListTable({ demands }: { demands: DemandRow[] }) {
  const { query, setQuery, status, setStatus, filtered } = useDemandListFilter(demands);

  return (
    <div className="bg-white border border-brand-charcoal/10 rounded-sm shadow-sm overflow-hidden">
      <DemandListToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        shown={filtered.length}
        total={demands.length}
      />

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
              {filtered.map((demand) => (
                <tr key={demand.id} className="hover:bg-brand-charcoal/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black mb-1">{demand.title}</div>
                    {demand.demandReferenceNumber && <div className="text-xs font-mono">Demand Lot Number: {demand.demandReferenceNumber}</div>}
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
              
              {filtered.length === 0 && (
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
  );
}
