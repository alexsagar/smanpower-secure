"use client";

import { useState } from "react";
import { createDocument } from "@/actions/compliance";
import { MediaInput } from "./MediaInput";
import { Loader2 } from "lucide-react";

export function ComplianceForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const result = await createDocument(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Document Title</label>
            <input name="title" required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. ISO 9001:2015 Certification" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Document Type</label>
            <select name="documentType" className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white">
              <option value="licence">Government Licence</option>
              <option value="certificate">ISO/Quality Certificate</option>
              <option value="policy">Corporate Policy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Description</label>
          <textarea name="description" rows={4} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="Details about this compliance record..." />
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Certificate / Document File</label>
          {/* Hidden field carries the URL into the form action. */}
          <input type="hidden" name="fileUrl" value={fileUrl} readOnly />
          <MediaInput
            value={fileUrl}
            onChange={(_, url) => setFileUrl(url)}
            label="Upload certificate image or PDF"
            allowedResourceTypes={["IMAGE", "DOCUMENT"]}
            uploadPurpose="cms_image"
            helperText="Shown as a downloadable/viewable document on the Trust Centre and homepage."
          />
        </div>
      </div>

      <div className="flex gap-8 py-4 border-t border-b border-brand-charcoal/10">
        <div className="flex items-center gap-4">
          <input type="checkbox" name="isPublic" id="isPublic" defaultChecked className="w-4 h-4 text-brand-gold border-brand-charcoal/20 rounded focus:ring-brand-gold" />
          <label htmlFor="isPublic" className="text-sm font-semibold text-brand-black">Visible on Trust Centre</label>
        </div>
        <div className="flex items-center gap-4">
          <input type="checkbox" name="isVerified" id="isVerified" defaultChecked className="w-4 h-4 text-emerald-500 border-brand-charcoal/20 rounded focus:ring-emerald-500" />
          <label htmlFor="isVerified" className="text-sm font-semibold text-brand-black">Mark as Verified</label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => window.history.back()} className="px-6 py-3 text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="bg-brand-black text-brand-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Document
        </button>
      </div>
    </form>
  );
}
