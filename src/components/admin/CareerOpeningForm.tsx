"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { archiveCareerAction, closeCareerAction, createCareerAction, openCareerAction, updateCareerAction } from "@/actions/careers";
import { MediaAssetMinimal, MediaSelector } from "./MediaSelector";

export function CareerOpeningForm({ assets, initialData }: { assets: MediaAssetMinimal[]; initialData?: any }) {
  const [selectedImageId, setSelectedImageId] = useState<string>(initialData?.featuredImageId || "");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(initialData?.featuredImage?.fileUrl || initialData?.featuredImage?.secureUrl || "");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      lang: formData.get("lang"),
      slug: formData.get("slug"),
      department: formData.get("department"),
      location: formData.get("location"),
      employmentType: formData.get("employmentType"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      responsibilities: formData.get("responsibilities"),
      applicationEmail: formData.get("applicationEmail"),
      applicationUrl: formData.get("applicationUrl"),
      deadline: formData.get("deadline"),
      imageId: selectedImageId || null,
      metaTitle: formData.get("metaTitle"),
      metaDescription: formData.get("metaDescription"),
      noIndex: formData.get("noIndex") === "on",
    };
    const payload = new FormData();
    payload.append("data", JSON.stringify(data));
    const result = initialData?.id ? await updateCareerAction(initialData.id, payload) : await createCareerAction(payload);
    if (!result?.success) {
      setError(result?.formError || "An error occurred");
      setIsPending(false);
      return;
    }
    window.location.href = "/admin/careers";
  }

  async function runAction(action: "open" | "close" | "archive") {
    if (!initialData?.id) return;
    setIsPending(true);
    setError(null);
    const result = action === "open"
      ? await openCareerAction(initialData.id)
      : action === "close"
      ? await closeCareerAction(initialData.id)
      : await archiveCareerAction(initialData.id);
    if (!result?.success) {
      setError((result as any)?.formError || "Action failed");
      setIsPending(false);
      return;
    }
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Title</label>
            <input name="title" defaultValue={initialData?.title} required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Slug</label>
            <input name="slug" defaultValue={initialData?.slug} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Language</label>
              <select name="lang" defaultValue={initialData?.lang || "en"} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white">
                <option value="en">English</option>
                <option value="ne">Nepali</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Employment Type</label>
              <input name="employmentType" defaultValue={initialData?.employmentType} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Department</label>
              <input name="department" defaultValue={initialData?.department} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Location</label>
              <input name="location" defaultValue={initialData?.location} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Featured Image</label>
            <MediaSelector assets={assets} selectedUrl={selectedImageUrl} onSelect={(assetId, assetUrl) => {
              setSelectedImageId(assetId);
              setSelectedImageUrl(assetUrl);
            }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Application Email</label>
            <input type="email" name="applicationEmail" defaultValue={initialData?.applicationEmail} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Application URL</label>
            <input type="url" name="applicationUrl" defaultValue={initialData?.applicationUrl} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Deadline</label>
            <input type="date" name="deadline" defaultValue={initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : ""} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-brand-black">
            <input type="checkbox" name="noIndex" defaultChecked={Boolean(initialData?.noIndex)} className="w-4 h-4" />
            Noindex
          </label>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Description</label>
          <textarea name="description" defaultValue={initialData?.description} required rows={6} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Requirements</label>
          <textarea name="requirements" defaultValue={initialData?.requirements} rows={5} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Responsibilities</label>
          <textarea name="responsibilities" defaultValue={initialData?.responsibilities} rows={5} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
        </div>
      </div>
      <div className="pt-6 mt-6 border-t border-brand-charcoal/10 space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-black">SEO Configuration</h3>
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">SEO Title</label>
          <input name="metaTitle" defaultValue={initialData?.metaTitle} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">SEO Description</label>
          <textarea name="metaDescription" defaultValue={initialData?.metaDescription} rows={2} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
        </div>
      </div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          {initialData?.id && initialData.status !== "OPEN" && (
            <button type="button" onClick={() => runAction("open")} disabled={isPending} className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors rounded">
              Open
            </button>
          )}
          {initialData?.id && initialData.status === "OPEN" && (
            <button type="button" onClick={() => runAction("close")} disabled={isPending} className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors rounded">
              Close
            </button>
          )}
          {initialData?.id && (
            <button type="button" onClick={() => runAction("archive")} disabled={isPending} className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-brand-charcoal/10 text-brand-charcoal hover:bg-brand-charcoal/20 transition-colors rounded">
              Archive
            </button>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => window.history.back()} className="px-6 py-3 text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="bg-brand-black text-brand-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {initialData?.id ? "Update Career" : "Save Career"}
          </button>
        </div>
      </div>
    </form>
  );
}
