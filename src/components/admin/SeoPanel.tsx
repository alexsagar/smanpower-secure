"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SeoPanelProps {
  initialData: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  onChange: (data: any) => void;
  canManageCanonical?: boolean;
}

export function SeoPanel({ initialData, onChange, canManageCanonical = false }: SeoPanelProps) {
  const [data, setData] = useState(initialData);

  const handleChange = (field: string, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const titleLength = data.metaTitle?.length || 0;
  const descLength = data.metaDescription?.length || 0;

  return (
    <div className="bg-white border rounded-md shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Search Engine Optimization</h3>
        <p className="text-sm text-gray-500">Configure how this page appears in search results and social media.</p>
      </div>

      {/* Google Preview */}
      <div className="bg-gray-50 border rounded-md p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">Search Result Preview</h4>
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <span>https://smanpower.com</span>
            <span className="text-gray-400">›</span>
            <span>...</span>
          </div>
          <h3 className="text-xl text-blue-800 font-medium hover:underline cursor-pointer truncate">
            {data.metaTitle || "Default Page Title | Seven Seas Intercontinental"}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {data.metaDescription || "Seven Seas Intercontinental connects international employers with trained Nepali talent..."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            value={data.metaTitle || ""}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
            placeholder="e.g. Construction Workers in Qatar | Seven Seas"
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${titleLength > 60 ? "text-red-500" : "text-gray-500"}`}>
              {titleLength} / 60 characters
            </span>
            {titleLength > 60 && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Too long
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm h-24 focus:ring-1 focus:ring-blue-500 outline-none"
            value={data.metaDescription || ""}
            onChange={(e) => handleChange("metaDescription", e.target.value)}
            placeholder="Brief summary for search engines..."
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${descLength > 160 ? "text-red-500" : "text-gray-500"}`}>
              {descLength} / 160 characters
            </span>
            {descLength > 160 && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> May be truncated in search results
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Image URL</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            value={data.ogImage || ""}
            onChange={(e) => handleChange("ogImage", e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">Use a 1200x630 image. Leave blank to use the site default.</p>
        </div>

        {canManageCanonical && (
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              Canonical URL Override 
              <span className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Advanced</span>
            </label>
            <input
              type="text"
              className="w-full border border-orange-200 bg-orange-50/50 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none"
              value={data.canonicalUrl || ""}
              onChange={(e) => handleChange("canonicalUrl", e.target.value)}
              placeholder="https://smanpower.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">Only change this if you are consolidating duplicate pages. Use a full absolute URL.</p>
          </div>
        )}
      </div>
    </div>
  );
}
