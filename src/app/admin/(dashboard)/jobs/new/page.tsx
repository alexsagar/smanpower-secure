import { notFound } from "next/navigation";
import { getAdminCountriesAndIndustries } from "@/services/admin.service";
import { JobForm } from "@/components/admin/JobForm";
import { Briefcase } from "lucide-react";
import Link from "next/link";

export default async function NewJobPage() {
  notFound();
  const { countries, industries } = await getAdminCountriesAndIndustries();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Briefcase className="w-3 h-3" /> Module // Jobs // New
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Post New Job
          </h1>
          <p className="text-brand-muted mt-2">
            Create a new international job vacancy for the candidate portal.
          </p>
        </div>
        <div>
          <Link href="/admin/jobs" className="text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
            Back to Jobs
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-8 shadow-sm">
        <JobForm countries={countries} industries={industries} />
      </div>
    </div>
  );
}
