import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminDemandById } from "@/services/demand.service";
import { DemandFormWizard } from "@/components/admin/demands/DemandFormWizard";
import { getAdminCountriesAndIndustries } from "@/services/admin.service";

export const metadata = {
  title: "Edit Demand | Admin",
};

export default async function EditDemandPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [demand, { countries, industries }] = await Promise.all([
    getAdminDemandById(resolvedParams.id),
    getAdminCountriesAndIndustries(),
  ]);

  if (!demand) {
    notFound();
  }

  // Map Date objects back to string format for form data
  // Include updatedAt for optimistic concurrency
  const initialData = {
    ...demand,
    updatedAt: demand.updatedAt ? new Date(demand.updatedAt).toISOString() : undefined,
    approvalDate: demand.approvalDate ? new Date(demand.approvalDate).toISOString() : "",
    receivedDate: demand.receivedDate ? new Date(demand.receivedDate).toISOString() : "",
    applicationStartDate: demand.applicationStartDate ? new Date(demand.applicationStartDate).toISOString() : "",
    applicationDeadline: demand.applicationDeadline ? new Date(demand.applicationDeadline).toISOString() : "",
    interviewDate: demand.interviewDate ? new Date(demand.interviewDate).toISOString() : "",
    positions: (demand.positions || []).map((p: any) => ({
      ...p,
      workHoursPerDay: p.workHoursPerDay != null ? String(p.workHoursPerDay) : "",
      workDaysPerWeek: p.workDaysPerWeek != null ? String(p.workDaysPerWeek) : "",
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/demands"
          className="inline-flex items-center gap-2 text-brand-charcoal hover:text-brand-gold transition-colors text-sm mb-4 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Demands
        </Link>
        <h1 className="text-2xl font-bold text-brand-black font-serif">Edit Demand: {demand.title}</h1>
        <p className="text-sm text-brand-charcoal/70">Update the details for this demand.</p>
      </div>

      <DemandFormWizard initialData={initialData} countries={countries} industries={industries} />
    </div>
  );
}
