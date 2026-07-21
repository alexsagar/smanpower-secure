"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
import { MediaPicker } from "./MediaPicker";
import type { MediaPurpose } from "@/lib/media-purposes";

interface MediaInputProps {
  value?: string;
  onChange: (id: string, url: string) => void;
  label?: string;
  allowedResourceTypes?: Array<"IMAGE" | "VIDEO" | "DOCUMENT">;
  uploadPurpose?: MediaPurpose;
  helperText?: string;
}

/**
 * A value may be a MediaAsset id (dedicated columns) or a URL string (media
 * fields inside block content). Only the latter can be previewed directly.
 */
function isPreviewableUrl(value?: string): boolean {
  if (!value) return false;
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
}

function isVideoUrl(value: string): boolean {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(value);
}

export function MediaInput({
  value,
  onChange,
  label = "Select Media",
  allowedResourceTypes,
  uploadPurpose,
  helperText,
}: MediaInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      {helperText ? (
        <p className="mb-2 text-xs text-gray-500">{helperText}</p>
      ) : null}
      
      <div 
        onClick={() => setPickerOpen(true)}
        className="w-full h-48 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-gold transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group rounded-lg"
      >
        {value ? (
          <>
            {isPreviewableUrl(value) ? (
              isVideoUrl(value) ? (
                <video
                  src={value}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={value}
                  alt={`${label} preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              )
            ) : (
              // Id-valued fields cannot be previewed without a lookup; keep the
              // existing indicator so those call sites are unchanged.
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ImageIcon className="w-8 h-8 text-brand-gold mb-2" />
                <span className="text-sm font-medium text-gray-700">Media Selected</span>
                <span className="text-xs text-gray-500 font-mono mt-1">{value}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <span className="text-white text-sm font-semibold tracking-widest uppercase">Change</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange("", "");
              }}
              className="absolute right-3 top-3 z-20 rounded-full bg-white p-1.5 text-gray-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Clear ${label}`}
              title={`Clear ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-gray-400 mb-3 group-hover:text-brand-gold transition-colors" />
            <span className="text-sm font-semibold text-gray-600">Click to browse media</span>
          </>
        )}
      </div>

      <MediaPicker 
        open={pickerOpen} 
        onClose={() => setPickerOpen(false)} 
        onSelect={(media) => {
          onChange(media.id, media.fileUrl);
        }}
        allowedResourceTypes={allowedResourceTypes}
        uploadPurpose={uploadPurpose}
      />
    </div>
  );
}
