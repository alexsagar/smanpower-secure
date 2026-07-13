"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Search, Image as ImageIcon, Video, FileText } from "lucide-react";
import { MediaUploader } from "./MediaUploader";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: any) => void;
  cloudName?: string;
}

export function MediaPicker({ open, onClose, onSelect, cloudName }: MediaPickerProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fetch("/api/admin/media/list")
        .then((res) => res.json())
        .then((data) => {
          setAssets(data.assets || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open]);

  if (!open) return null;

  const filteredAssets = assets.filter(
    (a) =>
      a.fileName.toLowerCase().includes(search.toLowerCase()) ||
      a.folder?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold">Select Media</h2>
            <p className="text-sm text-gray-500 mt-1">Choose an existing asset or upload a new one.</p>
          </div>
          <div className="flex items-center gap-4">
            <MediaUploader cloudName={cloudName} />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
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
        </div>

        {/* Grid */}
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
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="group relative aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-brand-gold hover:ring-2 hover:ring-brand-gold/20 transition-all"
                >
                  {asset.mimeType?.includes("video") ? (
                     <div className="w-full h-full flex items-center justify-center bg-gray-100">
                       <Video className="w-8 h-8 text-gray-400" />
                     </div>
                  ) : asset.mimeType?.includes("pdf") ? (
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
                    <p className="text-[10px] text-white truncate">{asset.fileName}</p>
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
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search or upload new media.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
