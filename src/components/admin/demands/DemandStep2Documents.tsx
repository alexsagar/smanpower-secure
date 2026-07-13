import React from "react";
import { Plus, Trash2, FileText, ExternalLink } from "lucide-react";
import { MediaInput } from "@/components/admin/MediaInput";

export function DemandStep2Documents({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const addDocument = () => {
    const newDocs = [
      ...(data.documents || []),
      {
        id: `temp_${Date.now()}`,
        mediaAssetId: "",
        title: "",
        description: "",
        documentType: "DEMAND_LETTER",
        visibility: "PUBLIC",
        approvalStatus: "PENDING",
      },
    ];
    updateData({ documents: newDocs });
  };

  const removeDocument = (id: string) => {
    const newDocs = data.documents.filter((d: any) => d.id !== id);
    updateData({ documents: newDocs });
  };

  const updateDocument = (id: string, field: string, value: any) => {
    const newDocs = data.documents.map((d: any) => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    });
    updateData({ documents: newDocs });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-bold font-serif mb-1">Official Documents</h3>
          <p className="text-sm text-brand-charcoal/70">Attach demand letters, agency agreements, and approval documents.</p>
        </div>
        <button
          onClick={addDocument}
          className="flex items-center gap-2 bg-brand-gold text-brand-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-brand-black hover:text-brand-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {!data.documents || data.documents.length === 0 ? (
        <div className="border-2 border-dashed border-brand-charcoal/20 p-12 text-center rounded-sm">
          <FileText className="w-12 h-12 text-brand-charcoal/20 mx-auto mb-4" />
          <h4 className="font-bold text-brand-black mb-1">No documents added</h4>
          <p className="text-sm text-brand-charcoal/60 mb-4">Add official documents related to this demand.</p>
          <button
            onClick={addDocument}
            className="text-sm font-bold text-brand-gold hover:text-brand-black transition-colors"
          >
            + Add First Document
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.documents.map((doc: any, index: number) => (
            <div key={doc.id} className="border border-brand-charcoal/10 rounded-sm p-4 bg-brand-charcoal/5 flex gap-4">
              <div className="w-32 h-32 shrink-0">
                <MediaInput
                  value={doc.mediaAssetId}
                  onChange={(id) => updateDocument(doc.id, "mediaAssetId", id)}
                  label=""
                />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Document Title</label>
                  <input
                    type="text"
                    value={doc.title}
                    onChange={(e) => updateDocument(doc.id, "title", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                    placeholder="e.g. Official Demand Letter"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Type</label>
                  <select
                    value={doc.documentType}
                    onChange={(e) => updateDocument(doc.id, "documentType", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                  >
                    <option value="DEMAND_LETTER">Demand Letter</option>
                    <option value="AGENCY_AGREEMENT">Agency Agreement</option>
                    <option value="POWER_OF_ATTORNEY">Power of Attorney</option>
                    <option value="EMPLOYMENT_CONTRACT">Employment Contract</option>
                    <option value="GUARANTEE_LETTER">Guarantee Letter</option>
                    <option value="DOFE_APPROVAL">DOFE Approval</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Visibility</label>
                  <select
                    value={doc.visibility}
                    onChange={(e) => updateDocument(doc.id, "visibility", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="INTERNAL">Internal Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Approval Status</label>
                  <select
                    value={doc.approvalStatus}
                    onChange={(e) => updateDocument(doc.id, "approvalStatus", e.target.value)}
                    className="w-full border-brand-charcoal/20 rounded-sm text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="shrink-0 flex items-start pt-6">
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                  title="Remove Document"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
