import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminDemands } from "@/services/demand.service";
import { DemandListTable } from "@/components/admin/demands/DemandListTable";

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

      <DemandListTable demands={demands as never} />
    </div>
  );
}
