import { notFound } from "next/navigation";
import { getAdminComplianceDocs } from "@/services/admin.service";
import Link from "next/link";
import { Edit2, Shield, ShieldAlert, ShieldCheck, Download, Plus } from "lucide-react";

export default async function AdminCompliancePage() {
  notFound();
  const documents = await getAdminComplianceDocs();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block">
            Module // Trust & Compliance
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Compliance Vault
          </h1>
          <p className="text-brand-muted mt-2">
            Manage official licences, certifications, and public corporate policies.
          </p>
        </div>
        <div>
          <Link href="/admin/compliance/new" className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Public Documents</h2>
          <span className="text-xs text-brand-muted font-mono">{documents.length} Entries</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Document Title</th>
                <th className="p-6 font-medium">Type</th>
                <th className="p-6 font-medium">Verification Status</th>
                <th className="p-6 font-medium">Visibility</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors">{doc.title}</div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-brand-charcoal/5 text-brand-charcoal">
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="p-6">
                    {(doc as any).isVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                        <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-medium text-brand-muted">
                      {doc.isPublic ? 'Public' : 'Internal'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button disabled className="text-brand-muted/50 cursor-not-allowed" title="Editing compliance documents is currently disabled">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
