"use client";

import { useState } from "react";
import { MediaSelector, MediaAssetMinimal } from "./MediaSelector";
import { createStoryAction, updateStoryAction, publishStoryAction, unpublishStoryAction } from "@/actions/success-stories";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { InsightContentEditor } from "./editor/InsightContentEditor";

export function StoryForm({ assets, initialData }: { assets: MediaAssetMinimal[], initialData?: any }) {
  const [selectedImageId, setSelectedImageId] = useState<string>(initialData?.featuredImageId || "");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(initialData?.featuredImage?.fileUrl || initialData?.featuredImage?.secureUrl || "");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(action: "publish" | "unpublish") {
    if (!initialData?.id) return;
    setIsPending(true);
    setError(null);
    try {
      let res;
      if (action === "publish") {
        res = await publishStoryAction(initialData.id);
      } else {
        res = await unpublishStoryAction(initialData.id);
      }
      
      if (!res.success) {
        setError((res as any).formError || "Action failed");
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      personName: formData.get("personName") as string,
      // Checkboxes must always be sent: the payload schema defaults them to
      // false, so an omitted flag silently clears it on every save.
      showPersonName: formData.get("showPersonName") === "on",
      featured: formData.get("featured") === "on",
      storyType: formData.get("storyType") as string,
      imageId: selectedImageId || null,
      summary: formData.get("summary") as string,
      content: formData.get("content") as string,
      quote: formData.get("quote") as string,
      // SEO
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
    };

    const payload = new FormData();
    payload.append("data", JSON.stringify(data));
    
    let result;
    if (initialData?.id) {
      result = await updateStoryAction(initialData.id, payload);
    } else {
      result = await createStoryAction(payload);
    }
    
    if (!result?.success) {
      setError(result.formError || "An error occurred");
      setIsPending(false);
    } else {
      window.location.href = "/admin/stories";
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
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Title</label>
            <input name="title" defaultValue={initialData?.title} required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Candidate Journey" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Slug</label>
            <input name="slug" defaultValue={initialData?.slug} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. candidate-journey-1" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Person or Company Name</label>
            <input name="personName" defaultValue={initialData?.personName} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Rajendra Thapa" />
            <label className="flex items-center gap-2 mt-3 text-xs text-brand-charcoal cursor-pointer">
              <input type="checkbox" name="showPersonName" defaultChecked={initialData?.showPersonName ?? false} className="accent-brand-gold" />
              Show this name publicly on the story page
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Story Type</label>
            <select name="storyType" defaultValue={initialData?.storyType || "CANDIDATE"} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white">
              <option value="CANDIDATE">Candidate Journey</option>
              <option value="EMPLOYER">Employer Partnership</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Featured Image</label>
            <MediaSelector assets={assets} selectedUrl={selectedImageUrl} onSelect={(assetId, assetUrl) => {
              setSelectedImageId(assetId);
              setSelectedImageUrl(assetUrl);
            }} />
            <label className="flex items-center gap-2 mt-3 text-xs text-brand-charcoal cursor-pointer">
              <input type="checkbox" name="featured" defaultChecked={initialData?.isFeatured ?? false} className="accent-brand-gold" />
              Feature on the homepage
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Occupation &amp; Location</label>
          <input name="summary" defaultValue={initialData?.summary} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Heavy Equipment Operator — Doha, Qatar" />
          <p className="text-[11px] text-brand-muted mt-2">Shown under the story title on the homepage card and the story page.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Pull Quote (Optional)</label>
          <textarea name="quote" defaultValue={initialData?.quote} rows={2} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="A short quote highlighted above the story body..." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Story Body</label>
          <InsightContentEditor
            name="content"
            initialHtml={initialData?.content}
            placeholder="Write the story — add headings, images, lists and pull quotes…"
            uploadPurpose="cms_image"
          />
        </div>
      </div>

      {/* SEO Section */}
      <div className="pt-6 mt-6 border-t border-brand-charcoal/10 space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-black">SEO Configuration</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Meta Title</label>
            <input name="metaTitle" defaultValue={initialData?.metaTitle} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Rajendra Thapa Success Story | Seven Seas" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Meta Description</label>
            <textarea name="metaDescription" defaultValue={initialData?.metaDescription} rows={2} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="Enter meta description..." />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div>
          {initialData?.id && (
            <div className="flex gap-2">
              {initialData.status === "DRAFT" ? (
                <button type="button" onClick={() => handleStatusChange("publish")} disabled={isPending} className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex items-center gap-1 rounded">
                  <CheckCircle className="w-3 h-3" /> Publish
                </button>
              ) : (
                <button type="button" onClick={() => handleStatusChange("unpublish")} disabled={isPending} className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors flex items-center gap-1 rounded">
                  <XCircle className="w-3 h-3" /> Revert to Draft
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => window.history.back()} className="px-6 py-3 text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="bg-brand-black text-brand-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {initialData?.id ? "Update Story" : "Save Story"}
          </button>
        </div>
      </div>
    </form>
  );
}
