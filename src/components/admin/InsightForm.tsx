"use client";

import { useState } from "react";
import { MediaInput } from "./MediaInput";
import { ArticleContentEditor } from "./editor/ArticleContentEditor";
import { createInsightAction, updateInsightAction, publishInsightAction, unpublishInsightAction } from "@/actions/insights";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function InsightForm({ initialData }: { initialData?: any }) {
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
        res = await publishInsightAction(initialData.id);
      } else {
        res = await unpublishInsightAction(initialData.id);
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
      lang: formData.get("lang") as string,
      category: formData.get("category") as string,
      featured: formData.get("featured") === "on",
      imageId: selectedImageId || null,
      summary: formData.get("summary") as string,
      content: formData.get("content") as string,
      authorId: initialData?.authorId || null, 
      // SEO
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
    };

    const payload = new FormData();
    payload.append("data", JSON.stringify(data));
    
    let result;
    if (initialData?.id) {
      result = await updateInsightAction(initialData.id, payload);
    } else {
      result = await createInsightAction(payload);
    }
    
    if (!result?.success) {
      setError(result.formError || "An error occurred");
      setIsPending(false);
    } else {
      window.location.href = "/admin/insights";
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
            <input name="title" defaultValue={initialData?.title} required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Navigating Overseas Employment" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Slug</label>
            <input name="slug" defaultValue={initialData?.slug} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. navigating-overseas-employment" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Language</label>
            <select name="lang" defaultValue={initialData?.lang || "en"} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white">
              <option value="en">English</option>
              <option value="ne">Nepali</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Category</label>
            <input name="category" list="insight-categories" defaultValue={initialData?.category?.name || initialData?.category || ""} required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="Choose or type a category" />
            <datalist id="insight-categories">
              <option value="Recruitment Insights" />
              <option value="Global Workforce" />
              <option value="Skills & Training" />
              <option value="Worker Welfare" />
              <option value="Industry Updates" />
              <option value="Success Stories" />
            </datalist>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <MediaInput
              label="Featured Image"
              value={selectedImageId}
              previewUrl={selectedImageUrl}
              allowedResourceTypes={["IMAGE"]}
              uploadPurpose="insight_image"
              onChange={(assetId, assetUrl) => {
                setSelectedImageId(assetId);
                setSelectedImageUrl(assetUrl);
              }}
            />
          </div>
          <div className="flex items-center gap-4 py-4">
            <input type="checkbox" defaultChecked={initialData?.featured} name="featured" id="featured" className="w-4 h-4 text-brand-gold border-brand-charcoal/20 rounded focus:ring-brand-gold" />
            <label htmlFor="featured" className="text-sm font-semibold text-brand-black">Mark as Featured Insight</label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Summary (Short)</label>
          <input name="summary" defaultValue={initialData?.summary} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. A brief overview of the article..." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Full Content</label>
          <ArticleContentEditor name="content" initialHtml={initialData?.content} />
        </div>
      </div>

      {/* SEO Section */}
      <div className="pt-6 mt-6 border-t border-brand-charcoal/10 space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-black">SEO Configuration</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Meta Title</label>
            <input name="metaTitle" defaultValue={initialData?.metaTitle} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Navigating Overseas Employment | Seven Seas" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Meta Description</label>
            <textarea name="metaDescription" defaultValue={initialData?.metaDescription} rows={2} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="Enter meta description for search engines..." />
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
            {initialData?.id ? "Update Insight" : "Save Insight"}
          </button>
        </div>
      </div>
    </form>
  );
}
