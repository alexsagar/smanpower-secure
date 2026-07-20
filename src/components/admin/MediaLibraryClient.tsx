"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, AlertCircle, FileText, Video, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function MediaLibraryClient({ initialAssets }: { initialAssets: any[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO" | "DOCUMENT">("ALL");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const filteredAssets = assets.filter((asset) => {
    if (filter === "ALL") return true;
    return asset.resourceType === filter;
  });

  const handleDelete = async () => {
    if (!selectedAsset) return;
    if (!confirm("Are you sure you want to delete this media asset? This might break pages where it's used.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAsset.id, public_id: selectedAsset.publicId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete");
      }

      setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));
      setSelectedAsset(null);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main Grid Area */}
      <div className={`flex-1 bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm transition-all ${selectedAsset ? "md:w-2/3" : "w-full"}`}>
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <div className="flex gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Media Gallery</h2>
          </div>
          <div className="flex gap-2 text-xs font-semibold tracking-widest uppercase">
            {(["ALL", "IMAGE", "VIDEO", "DOCUMENT"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded transition-colors ${
                  filter === f
                    ? "bg-brand-charcoal/5 text-brand-charcoal"
                    : "text-brand-muted hover:text-brand-black"
                }`}
              >
                {f === "ALL" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 h-[600px] overflow-y-auto">
          {filteredAssets.length > 0 ? (
            <div className={`grid gap-4 ${selectedAsset ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"}`}>
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`group relative aspect-square bg-brand-off-white border ${selectedAsset?.id === asset.id ? "border-brand-gold ring-2 ring-brand-gold/20" : "border-brand-charcoal/5"} overflow-hidden cursor-pointer`}
                >
                  {asset.resourceType === "VIDEO" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                  )}

                  <div className="absolute top-2 left-2 z-10">
                    {asset.status === "REAL_APPROVED" ? (
                      <div className="bg-emerald-500/90 backdrop-blur text-white p-1 rounded shadow-sm" title="Approved">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    ) : asset.status === "AI_PLACEHOLDER" ? (
                      <div className="bg-brand-gold/90 backdrop-blur text-brand-black p-1 rounded shadow-sm" title="AI Placeholder">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                    ) : null}
                  </div>
                  <div className="absolute bottom-2 left-2 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {asset.resourceType || "FILE"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <p className="text-brand-black font-semibold text-lg">No media found</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Details Area */}
      {selectedAsset && (
        <div className="w-full md:w-1/3 bg-white border border-brand-charcoal/10 p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold truncate pr-4">{selectedAsset.fileName}</h3>
            <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="aspect-video relative bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
             {selectedAsset.resourceType === "VIDEO" ? (
               <video src={selectedAsset.fileUrl} controls muted preload="metadata" className="w-full h-full object-contain" />
             ) : selectedAsset.resourceType === "DOCUMENT" ? (
               <FileText className="w-12 h-12 text-gray-400" />
             ) : (
                <Image src={selectedAsset.fileUrl} alt="Preview" fill sizes="50vw" className="object-contain" />
             )}
          </div>

          <div className="text-sm space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Folder</span>
              <span className="font-medium">{selectedAsset.folder || "--"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Size</span>
              <span className="font-medium">{selectedAsset.fileSize ? (selectedAsset.fileSize / 1024).toFixed(0) + " KB" : "--"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Resource Type</span>
              <span className="font-medium truncate max-w-[150px]">{selectedAsset.resourceType || "--"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">MIME</span>
              <span className="font-medium truncate max-w-[150px]">{selectedAsset.mimeType || "--"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium">{typeof selectedAsset.duration === "number" ? `${selectedAsset.duration.toFixed(1)}s` : "--"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Visibility</span>
              <span className="font-medium">{selectedAsset.isPublic ? "Public" : "Private"}</span>
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-3 border-t border-gray-100">
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedAsset.fileUrl);
                alert("URL copied!");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-black py-2 text-sm font-semibold rounded transition"
            >
              Copy URL
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 text-sm font-semibold rounded flex items-center justify-center gap-2 transition"
            >
              {isDeleting ? "Deleting..." : <><Trash2 className="w-4 h-4" /> Delete Asset</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
