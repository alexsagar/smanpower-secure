"use client";

import { useState } from "react";
import { Plus, Edit2, Search, Link as LinkIcon, Globe, AlertCircle, X, Save } from "lucide-react";
import { saveSeoPageMeta } from "@/actions/seo";
import { ALLOWED_SEO_PATHS } from "@/lib/seo-paths";
import { toast } from "sonner";

type SeoPage = {
  id?: string;
  pagePath: string;
  lang: string;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  noIndex: boolean;
};

export default function SeoClient({ initialPages }: { initialPages: SeoPage[] }) {
  const [pages, setPages] = useState<SeoPage[]>(initialPages);
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (page: SeoPage) => {
    setEditingPage(page);
    setError(null);
  };

  const handleNew = () => {
    setEditingPage({
      pagePath: "/",
      lang: "en",
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      canonicalUrl: "",
      ogImage: "",
      ogTitle: "",
      ogDescription: "",
      noIndex: false,
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setIsSaving(true);
    setError(null);
    try {
      const result = await saveSeoPageMeta(editingPage);
      if (result.success) {
        toast.success("SEO Metadata saved successfully");
        setEditingPage(null);
        // Optimistic update
        setPages((prev) => {
          const index = prev.findIndex((p) => p.pagePath === editingPage.pagePath && p.lang === editingPage.lang);
          if (index >= 0) {
            const newPages = [...prev];
            newPages[index] = { ...editingPage, id: result.record.id };
            return newPages;
          }
          return [...prev, { ...editingPage, id: result.record.id }];
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save SEO metadata");
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
            <Search className="w-3 h-3" /> Module // Optimization
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            SEO & Routing
          </h1>
          <p className="text-brand-muted mt-2">
            Manage metadata, canonicals, and indexing directives for global reach.
          </p>
        </div>
        <div>
          <button onClick={handleNew} className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Page Rule
          </button>
        </div>
      </div>

      {/* Visual Analytics Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-black text-white border border-brand-black p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-white/40 uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-gold" /> Indexed Pages
            </span>
            <div className="text-4xl font-light tracking-tight">{pages.filter(p => !p.noIndex).length}</div>
          </div>
        </div>
        
        <div className="bg-white border border-brand-charcoal/5 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">No-Index Routes</span>
            <div className="text-4xl font-light text-brand-black tracking-tight">{pages.filter(p => p.noIndex).length}</div>
          </div>
        </div>

        <div className="bg-white border border-brand-charcoal/5 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">Missing Meta Titles</span>
            <div className="text-4xl font-light text-brand-black tracking-tight flex items-center gap-3">
              {pages.filter(p => !p.metaTitle).length}
              {pages.filter(p => !p.metaTitle).length > 0 && (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Page Metadata</h2>
          <span className="text-xs text-brand-muted font-mono">{pages.length} Routes</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold bg-white">
                <th className="p-6 font-medium">Route Path & Lang</th>
                <th className="p-6 font-medium">Indexing</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {pages.length > 0 ? pages.map((page, idx) => (
                <tr key={idx} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-2">
                      <LinkIcon className="w-3.5 h-3.5 text-brand-muted" />
                      {page.pagePath} ({page.lang})
                    </div>
                    <div className="text-xs text-brand-muted mt-1 max-w-[300px] truncate">
                      {page.metaTitle || <span className="text-amber-600 font-medium">Missing Title</span>}
                    </div>
                  </td>
                  <td className="p-6">
                    {page.noIndex ? (
                      <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest border border-brand-charcoal/10 px-2 py-1 rounded">No-Index</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest border border-emerald-600/20 px-2 py-1 rounded">Indexed</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => handleEdit(page)} className="text-brand-muted hover:text-brand-gold transition-colors">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-brand-muted">
                    No SEO page metadata has been configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-brand-charcoal/10 shadow-xl">
            <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
              <h2 className="text-lg font-semibold text-brand-black tracking-tight">Edit SEO Metadata</h2>
              <button onClick={() => setEditingPage(null)} className="text-brand-muted hover:text-brand-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded text-sm flex items-start gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Page Path</label>
                  <select 
                    value={editingPage.pagePath}
                    onChange={(e) => setEditingPage({ ...editingPage, pagePath: e.target.value })}
                    className="w-full border-brand-charcoal/20 border rounded p-2 text-sm"
                    disabled={!!editingPage.id} // Don't edit path if already created
                  >
                    {ALLOWED_SEO_PATHS.map((path) => (
                      <option key={path} value={path}>{path}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Language</label>
                  <select 
                    value={editingPage.lang}
                    onChange={(e) => setEditingPage({ ...editingPage, lang: e.target.value })}
                    className="w-full border-brand-charcoal/20 border rounded p-2 text-sm"
                    disabled={!!editingPage.id}
                  >
                    <option value="en">English (en)</option>
                    <option value="ne">Nepali (ne)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Meta Title</label>
                <input 
                  type="text" 
                  value={editingPage.metaTitle || ""} 
                  onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                  className="w-full border-brand-charcoal/20 border rounded p-2 text-sm"
                  placeholder="e.g. Overseas Recruitment Agency..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Meta Description</label>
                <textarea 
                  value={editingPage.metaDescription || ""} 
                  onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                  className="w-full border-brand-charcoal/20 border rounded p-2 text-sm min-h-[100px]"
                  placeholder="e.g. Seven Seas connects global employers..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Canonical URL Override</label>
                <input 
                  type="text" 
                  value={editingPage.canonicalUrl || ""} 
                  onChange={(e) => setEditingPage({ ...editingPage, canonicalUrl: e.target.value })}
                  className="w-full border-brand-charcoal/20 border rounded p-2 text-sm"
                  placeholder="e.g. https://smanpower.com/en/employers (Requires permission)"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="noIndex"
                  checked={editingPage.noIndex}
                  onChange={(e) => setEditingPage({ ...editingPage, noIndex: e.target.checked })}
                  className="rounded border-brand-charcoal/20"
                />
                <label htmlFor="noIndex" className="text-sm font-medium text-brand-black">No-Index (Prevent search engines from indexing this page)</label>
              </div>
            </div>

            <div className="p-6 border-t border-brand-charcoal/5 bg-brand-off-white flex justify-end gap-4">
              <button 
                onClick={() => setEditingPage(null)}
                className="px-6 py-2 text-sm font-semibold uppercase tracking-widest text-brand-muted hover:text-brand-black transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-black text-brand-white px-6 py-2 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
