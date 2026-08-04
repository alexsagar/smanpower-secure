"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Search, Image as ImageIcon, Video, FileText, Check } from "lucide-react";
import { MediaUploader } from "./MediaUploader";
import type { MediaPurpose } from "@/lib/media-purposes";

type MediaAssetRecord = {
  id: string;
  fileUrl: string;
  fileName: string;
  altText?: string | null;
  folder?: string | null;
  mimeType?: string | null;
  resourceType?: "IMAGE" | "VIDEO" | "DOCUMENT";
  duration?: number | null;
};

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaAssetRecord) => void;
  allowedResourceTypes?: Array<"IMAGE" | "VIDEO" | "DOCUMENT">;
  uploadPurpose?: MediaPurpose;
  /**
   * Let the editor tick several assets and add them in one go. Without it the
   * picker keeps its original behaviour exactly: one click selects and closes.
   */
  multiple?: boolean;
  /**
   * Called instead of `onSelect` when `multiple` is set, with the ticked assets
   * in the order they were ticked.
   */
  onSelectMany?: (media: MediaAssetRecord[]) => void;
}

const RESOURCE_TYPE_FILTERS = ["ALL", "IMAGE", "VIDEO", "DOCUMENT"] as const;

export function mergeMediaAssets(
  current: MediaAssetRecord[],
  next: MediaAssetRecord | MediaAssetRecord[] | null | undefined
) {
  const incoming = Array.isArray(next) ? next : next ? [next] : [];
  const byKey = new Map<string, MediaAssetRecord>();

  for (const asset of [...incoming, ...current]) {
    const key = asset.id || asset.fileUrl;
    if (key && !byKey.has(key)) byKey.set(key, asset);
  }

  return Array.from(byKey.values());
}

export function mediaAssetMatchesPickerFilters(
  asset: MediaAssetRecord,
  search: string,
  selectedFilter: (typeof RESOURCE_TYPE_FILTERS)[number],
  allowedResourceTypes?: Array<"IMAGE" | "VIDEO" | "DOCUMENT">
) {
  const allowedByField =
    !allowedResourceTypes?.length ||
    (asset.resourceType && allowedResourceTypes.includes(asset.resourceType));
  if (!allowedByField) return false;

  const allowedByActiveFilter =
    selectedFilter === "ALL" || asset.resourceType === selectedFilter;
  if (!allowedByActiveFilter) return false;

  const lowered = search.toLowerCase();
  return (
    asset.fileName.toLowerCase().includes(lowered) ||
    Boolean(asset.folder?.toLowerCase().includes(lowered))
  );
}

/** Toggle an asset id in a selection list, preserving the order ticked. */
export function toggleSelectedId(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id];
}

/** Resolve ticked ids back to assets, in tick order, skipping any that vanished. */
export function orderedSelection(
  assets: MediaAssetRecord[],
  selectedIds: string[]
): MediaAssetRecord[] {
  return selectedIds
    .map((id) => assets.find((asset) => asset.id === id))
    .filter((asset): asset is MediaAssetRecord => Boolean(asset));
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  allowedResourceTypes,
  uploadPurpose,
  multiple = false,
  onSelectMany,
}: MediaPickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof RESOURCE_TYPE_FILTERS)[number]>(
    allowedResourceTypes?.length === 1 ? allowedResourceTypes[0] : "ALL"
  );

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    let cancelled = false;

    async function loadAssets() {
      setLoading(true);

      try {
        const res = await fetch("/api/admin/media/list");
        const data = await res.json();

        if (!cancelled) {
          setAssets((current) => mergeMediaAssets(data.assets || [], current));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAssets();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const selectedFilter =
    allowedResourceTypes?.length === 1 ? allowedResourceTypes[0] : activeFilter;

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) =>
      mediaAssetMatchesPickerFilters(asset, search, selectedFilter, allowedResourceTypes)
    );
  }, [allowedResourceTypes, assets, search, selectedFilter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold">Select Media</h2>
            <p className="text-sm text-gray-500 mt-1">
              {multiple
                ? "Tick several assets, or upload a batch, then add them all at once."
                : "Choose an existing asset or upload a placement-safe file."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {uploadPurpose ? (
              <MediaUploader
                purpose={uploadPurpose}
                multiple={multiple}
                onUploadComplete={(media) => {
                  const asset = media as MediaAssetRecord;
                  setAssets((current) => mergeMediaAssets(current, asset));
                  // Freshly uploaded files are almost always what the editor
                  // wants, so tick them rather than making them hunt the grid.
                  if (multiple && asset?.id) {
                    setSelectedIds((current) => (current.includes(asset.id) ? current : [...current, asset.id]));
                  }
                }}
              />
            ) : null}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename or folder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {RESOURCE_TYPE_FILTERS.map((filter) => {
              const disabled =
                filter !== "ALL" &&
                allowedResourceTypes?.length &&
                !allowedResourceTypes.includes(filter as "IMAGE" | "VIDEO" | "DOCUMENT");

              return (
                <button
                  key={filter}
                  type="button"
                  disabled={Boolean(disabled)}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition ${
                    selectedFilter === filter
                      ? "bg-brand-black text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  } ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-brand-gold hover:text-brand-black"}`}
                >
                  {filter === "ALL" ? "All Types" : filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Loading media library...</p>
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  role={multiple ? "checkbox" : "button"}
                  aria-checked={multiple ? selectedIds.includes(asset.id) : undefined}
                  tabIndex={0}
                  aria-label={asset.altText || asset.fileName}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.currentTarget.click();
                    }
                  }}
                  onClick={() => {
                    if (multiple) {
                      setSelectedIds((current) => toggleSelectedId(current, asset.id));
                      return;
                    }
                    onSelect(asset);
                    onClose();
                  }}
                  className={`group relative aspect-square bg-white border rounded-lg overflow-hidden cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                    multiple && selectedIds.includes(asset.id)
                      ? "border-brand-gold ring-2 ring-brand-gold"
                      : "border-gray-200 hover:border-brand-gold hover:ring-2 hover:ring-brand-gold/20"
                  }`}
                >
                  {multiple ? (
                    <span
                      aria-hidden
                      className={`absolute top-2 left-2 z-10 flex h-5 w-5 items-center justify-center rounded border ${
                        selectedIds.includes(asset.id)
                          ? "border-brand-gold bg-brand-gold text-brand-black"
                          : "border-white/70 bg-black/40"
                      }`}
                    >
                      {selectedIds.includes(asset.id) ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                  ) : null}
                  {asset.resourceType === "VIDEO" ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
                      <Video className="w-8 h-8 text-gray-400" />
                      {typeof asset.duration === "number" ? (
                        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {asset.duration.toFixed(1)}s
                        </span>
                      ) : null}
                    </div>
                  ) : asset.resourceType === "DOCUMENT" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={asset.fileUrl}
                      alt={asset.altText || asset.fileName}
                      fill
                      sizes="(max-width: 768px) 100vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] text-white truncate">{asset.fileName}</p>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-white/80">
                        {asset.resourceType || "FILE"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">No media found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting the search or resource-type filter.</p>
            </div>
          )}
        </div>

        {/* Multi-select needs an explicit confirm: in single mode a click is the
            confirm, but here the editor is still building a selection. */}
        {multiple ? (
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-white p-4">
            <p className="text-sm text-gray-600" aria-live="polite">
              {selectedIds.length === 0
                ? "No assets selected"
                : `${selectedIds.length} selected`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                disabled={selectedIds.length === 0}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-brand-black disabled:opacity-40"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={() => {
                  onSelectMany?.(orderedSelection(assets, selectedIds));
                  onClose();
                }}
                className="rounded-lg bg-brand-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-gold hover:text-brand-black disabled:opacity-40 disabled:hover:bg-brand-black disabled:hover:text-white"
              >
                {selectedIds.length > 1 ? `Add ${selectedIds.length} assets` : "Add asset"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
