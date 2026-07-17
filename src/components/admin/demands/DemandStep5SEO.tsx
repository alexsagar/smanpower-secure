"use client";

import React from "react";
import { Globe, Search, AlertTriangle } from "lucide-react";

export function DemandStep5SEO({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const isEdit = !!data.id;
  const isPublished = data.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold font-serif mb-1">SEO &amp; Review</h3>
        <p className="text-sm text-brand-charcoal/70 mb-6">Configure how this demand appears on search engines. Status and visibility are managed separately via lifecycle actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          <div className="bg-brand-charcoal/5 p-6 rounded-sm border border-brand-charcoal/10">
            <h4 className="font-bold text-brand-black mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-gold" /> Search Engine Optimization
            </h4>
            
            <div className="space-y-4">
              {isEdit && data.slug && (
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-brand-charcoal/60">Current Slug</label>
                  <div className="flex items-center bg-white border border-brand-charcoal/15 rounded-sm px-3 py-2">
                    <span className="text-brand-charcoal/50 text-sm whitespace-nowrap">smanpower.com/demands/</span>
                    <span className="text-sm font-mono font-semibold text-brand-black">{data.slug}</span>
                  </div>
                  {isPublished && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Published slugs are locked. Contact a developer to change.
                    </p>
                  )}
                  {!isPublished && (
                    <p className="text-xs text-brand-charcoal/50 mt-1">Slug is generated automatically from the title on first save.</p>
                  )}
                </div>
              )}

              {!isEdit && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-sm">
                  <p className="text-xs text-blue-700">
                    <strong>URL slug will be generated automatically</strong> from the demand title when saved. 
                    You do not need to set it manually.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">SEO Title</label>
                <input
                  type="text"
                  value={data.seoTitle || ""}
                  onChange={(e) => updateData({ seoTitle: e.target.value })}
                  className="w-full border border-brand-charcoal/20 rounded-sm text-sm px-3 py-2"
                  placeholder={data.title || "SEO Title (defaults to demand title)"}
                />
                <p className="text-xs text-brand-charcoal/50 mt-1">Leave blank to use the demand title.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Meta Description</label>
                <textarea
                  value={data.metaDescription || ""}
                  onChange={(e) => updateData({ metaDescription: e.target.value })}
                  className="w-full border border-brand-charcoal/20 rounded-sm text-sm px-3 py-2"
                  rows={3}
                  placeholder="A brief description for search engine results..."
                />
                <p className="text-xs text-brand-charcoal/50 mt-1">
                  {(data.metaDescription || "").length}/160 characters recommended.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">OG Image URL</label>
                <input
                  type="text"
                  value={data.ogImageUrl || ""}
                  onChange={(e) => updateData({ ogImageUrl: e.target.value })}
                  className="w-full border border-brand-charcoal/20 rounded-sm text-sm px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Canonical URL Override</label>
                <input
                  type="text"
                  value={data.canonicalUrl || ""}
                  onChange={(e) => updateData({ canonicalUrl: e.target.value })}
                  className="w-full border border-brand-charcoal/20 rounded-sm text-sm px-3 py-2"
                  placeholder="Leave blank for automatic"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-brand-charcoal/5 p-6 rounded-sm border border-brand-charcoal/10">
            <h4 className="font-bold text-brand-black mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-gold" /> Current Status
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-charcoal/70">Status</span>
                <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  data.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                  data.status === "CLOSED" ? "bg-red-100 text-red-800" :
                  data.status === "ARCHIVED" ? "bg-gray-100 text-gray-800" :
                  "bg-brand-charcoal/10 text-brand-charcoal"
                }`}>
                  {data.status || "DRAFT"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-charcoal/70">Visibility</span>
                <span className={`text-xs font-bold ${data.isPublic ? "text-green-700" : "text-brand-charcoal/50"}`}>
                  {data.isPublic ? "Public" : "Private"}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-brand-charcoal/10">
              <p className="text-xs text-brand-charcoal/60">
                Status and visibility are controlled via <strong>Publish</strong>, <strong>Close</strong>, and <strong>Archive</strong> buttons on the demands list page.
                Saving this form will only update content, not change the demand&apos;s status.
              </p>
            </div>
          </div>
          
          <div className="bg-brand-gold/10 p-4 border border-brand-gold/30 rounded-sm text-sm">
            <p className="font-bold text-brand-black mb-1">Ready to save?</p>
            <p className="text-brand-charcoal/80 mb-3">Ensure all documents are uploaded and positions are correct. Click &quot;Save Demand&quot; below to persist your changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
