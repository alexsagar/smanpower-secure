import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemandFormWizard } from "@/components/admin/demands/DemandFormWizard";
import { getAdminCountriesAndIndustries } from "@/services/admin.service";

export const metadata = {
  title: "Create Demand | Admin",
};

export default async function NewDemandPage() {
  // Loaded server-side so the country selector is populated in the first paint
  // rather than after a client round-trip that could fail silently.
  const { countries, industries } = await getAdminCountriesAndIndustries();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/demands"
          className="inline-flex items-center gap-2 text-brand-charcoal hover:text-brand-gold transition-colors text-sm mb-4 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Demands
        </Link>
        <h1 className="text-2xl font-bold text-brand-black font-serif">Create New Demand</h1>
        <p className="text-sm text-brand-charcoal/70">Follow the steps below to setup a new international manpower demand.</p>
      </div>

      <DemandFormWizard countries={countries} industries={industries} />
    </div>
  );
}
