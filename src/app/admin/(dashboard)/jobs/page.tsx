import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/shared";
import { formatDate, formatEnum } from "@/lib/utils";
import { DeleteJobButton } from "./DeleteJobButton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { getAdminJobs } from "@/services/admin.service";

export default async function AdminJobsPage() {
  const jobs = await getAdminJobs();

  const statusVariant: Record<string, "default" | "gold" | "success" | "warning" | "danger"> = {
    DRAFT: "default",
    PENDING_REVIEW: "warning",
    PUBLISHED: "success",
    EXPIRED: "danger",
    ARCHIVED: "default",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-brand-black">Job Management</h1>
          <p className="text-sm text-brand-muted mt-1">
            Create, manage, and track job listings.
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button variant="gold" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Job
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-brand-charcoal/5">
        {jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-charcoal/5 bg-brand-off-white">
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Title</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Country</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Industry</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Apps</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Deadline</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-brand-charcoal/5 last:border-b-0 hover:bg-brand-off-white/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-brand-charcoal">{job.title}</span>
                      <span className="block text-xs text-brand-muted mt-0.5">
                        {job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">{job.country.name}</td>
                    <td className="px-6 py-4 text-brand-muted">{job.industry.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[job.status] || "default"}>
                        {formatEnum(job.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">
                      {(job as any)._count?.applications || 0}
                    </td>
                    <td className="px-6 py-4 text-brand-muted text-xs">
                      {job.deadline ? formatDate(job.deadline) : "—"}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <button disabled className="cursor-not-allowed" title="Editing jobs is currently disabled">
                        <ArrowRight className="w-4 h-4 text-brand-muted/50 inline-block" />
                      </button>
                      <DeleteJobButton id={job.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-brand-muted mb-4">
              No jobs created yet.
            </p>
            <Link href="/admin/jobs/new">
              <Button variant="gold" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Your First Job
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
