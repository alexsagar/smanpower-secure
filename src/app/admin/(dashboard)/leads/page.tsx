import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/shared";
import { formatDate, formatEnum } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { getAdminLeads } from "@/services/admin.service";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  notFound();
  const params = await searchParams;
  const filterStatus = typeof params.status === "string" ? (params.status as string) : undefined;

  const leads = await getAdminLeads({ status: filterStatus });

  const statusVariant: Record<string, "default" | "gold" | "success" | "warning" | "danger"> = {
    NEW: "gold",
    CONTACTED: "default",
    QUALIFIED: "success",
    PROPOSAL_SENT: "warning",
    CLOSED: "success",
    LOST: "danger",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-brand-black">Employer Leads</h1>
          <p className="text-sm text-brand-muted mt-1">
            Manage workforce enquiries and recruitment leads.
          </p>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/5">
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-charcoal/5 bg-brand-off-white">
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Contact</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Country</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Industry</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Recruiter</th>
                  <th className="text-left px-6 py-3 font-medium text-brand-muted">Date</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-brand-charcoal/5 last:border-b-0 hover:bg-brand-off-white/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-brand-charcoal">
                      {lead.companyName}
                    </td>
                    <td className="px-6 py-4 text-brand-muted">
                      <div>{lead.contactPerson}</div>
                      <div className="text-xs text-brand-muted/70">{lead.businessEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">{lead.country}</td>
                    <td className="px-6 py-4 text-brand-muted">{lead.industry}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[lead.status] || "default"}>
                        {formatEnum(lead.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">
                      {(lead as any).assignedRecruiter?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-brand-muted text-xs">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <button disabled className="cursor-not-allowed" title="Viewing lead details is currently disabled">
                        <ArrowRight className="w-4 h-4 text-brand-muted/50" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-brand-muted mb-4">
              No employer leads yet. Leads will appear here when employers submit the workforce request form.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
