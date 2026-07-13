"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";

export interface MediaAssetMinimal {
  id: string;
  fileUrl: string;
  fileName: string;
}

interface MediaSelectorProps {
  assets: MediaAssetMinimal[];
  onSelect: (assetId: string, assetUrl: string) => void;
  selectedUrl?: string;
}

export function MediaSelector({ assets, onSelect, selectedUrl }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Current Selection / Trigger Button */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full h-48 border-2 border-dashed border-brand-charcoal/20 bg-brand-off-white hover:bg-brand-charcoal/5 hover:border-brand-gold/50 transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group"
      >
        {selectedUrl ? (
          <>
            <Image src={selectedUrl} alt="Selected media" fill sizes="100vw" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-semibold tracking-widest uppercase">Change Image</span>
            </div>
          </>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-brand-muted mb-3" />
            <span className="text-sm font-semibold text-brand-charcoal tracking-widest uppercase">Select Image</span>
            <span className="text-xs text-brand-muted mt-1">Click to browse media library</span>
          </>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-charcoal/10 flex justify-between items-center bg-brand-off-white">
              <h3 className="text-lg font-semibold text-brand-black tracking-widest uppercase">Media Library</h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-muted hover:text-brand-black transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Grid */}
            <div className="p-6 overflow-y-auto flex-1">
              {assets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {assets.map((asset) => (
                    <div 
                      key={asset.id} 
                      onClick={() => {
                        onSelect(asset.id, asset.fileUrl);
                        setIsOpen(false);
                      }}
                      className="group relative aspect-square bg-brand-off-white border border-brand-charcoal/5 overflow-hidden cursor-pointer hover:border-brand-gold/50 transition-colors"
                    >
                      <Image
                        src={asset.fileUrl}
                        alt={asset.fileName}
                        fill
                        sizes="(max-width: 768px) 100vw, 20vw"
                        className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-[9px] text-white/90 font-mono truncate">{asset.fileName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-brand-muted mb-4" />
                  <p className="text-brand-black font-semibold">Library is empty</p>
                  <p className="text-brand-muted text-sm mt-1">Upload images via the Media module first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
