"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, Maximize2, X, FileText } from "lucide-react";
import { CmsDemandDocument } from "@/types/content";
import { resolveMediaUrl } from "@/lib/media-resolver";

interface DemandDocumentViewerProps {
  documents: CmsDemandDocument[];
}

export function DemandDocumentViewer({ documents }: DemandDocumentViewerProps) {
  const [fullscreenDoc, setFullscreenDoc] = useState<CmsDemandDocument | null>(null);

  const publicDocs = documents.filter((d) => d.visibility === "PUBLIC" && d.approvalStatus === "APPROVED");

  if (publicDocs.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicDocs.map((doc) => {
          if (!doc.mediaAsset) return null;
          
          const resolvedUrl = resolveMediaUrl(doc.mediaAsset);
          const isPdf = doc.mediaAsset.resourceType === "document" || resolvedUrl.endsWith(".pdf");

          return (
            <div key={doc.id} className="bg-white border border-brand-charcoal/10 rounded-sm overflow-hidden flex flex-col group">
              {/* Preview Area */}
              <div className="aspect-[4/3] bg-brand-charcoal/5 relative border-b border-brand-charcoal/10 flex items-center justify-center overflow-hidden">
                {isPdf ? (
                  <FileText className="w-16 h-16 text-brand-charcoal/20" />
                ) : (
                  <Image
                    src={resolvedUrl}
                    alt={doc.title || "Document"}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  {!isPdf && (
                    <button
                      onClick={() => setFullscreenDoc(doc)}
                      className="p-3 bg-white text-brand-black rounded-full hover:bg-brand-gold transition-colors"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  )}
                  <a
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-3 bg-white text-brand-black rounded-full hover:bg-brand-gold transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4 flex-1">
                <h4 className="font-bold text-brand-black text-sm mb-1 line-clamp-1">
                  {doc.title || "Official Document"}
                </h4>
                {doc.description && (
                  <p className="text-xs text-brand-charcoal/60 line-clamp-2">
                    {doc.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenDoc && fullscreenDoc.mediaAsset && (
        <div className="fixed inset-0 z-50 bg-brand-black/95 flex items-center justify-center p-4 md:p-8">
          <button
            onClick={() => setFullscreenDoc(null)}
            className="absolute top-4 right-4 text-white hover:text-brand-gold transition-colors p-2"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full h-full max-w-5xl max-h-screen">
            <Image
              src={resolveMediaUrl(fullscreenDoc.mediaAsset)}
              alt={fullscreenDoc.title || "Document Fullscreen"}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
