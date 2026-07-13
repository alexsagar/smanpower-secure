"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
import { MediaPicker } from "./MediaPicker";

interface MediaInputProps {
  value?: string;
  onChange: (id: string, url: string) => void;
  label?: string;
}

export function MediaInput({ value, onChange, label = "Select Media" }: MediaInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      
      <div 
        onClick={() => setPickerOpen(true)}
        className="w-full h-48 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-gold transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group rounded-lg"
      >
        {value ? (
          <>
            {/* If we only have an ID and no URL cached locally, we might just show a generic icon, but usually we resolve it. For now, assuming value is URL or ID, we'll try to show it if it's a URL or rely on the parent resolving it. Actually, the CMS blocks store `imageId` which is a string. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ImageIcon className="w-8 h-8 text-brand-gold mb-2" />
              <span className="text-sm font-medium text-gray-700">Media Selected</span>
              <span className="text-xs text-gray-500 font-mono mt-1">{value}</span>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <span className="text-white text-sm font-semibold tracking-widest uppercase">Change</span>
            </div>
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
      />
    </div>
  );
}
