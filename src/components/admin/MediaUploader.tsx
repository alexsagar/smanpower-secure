"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MediaUploader({ cloudName }: { cloudName?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!cloudName) {
    return (
      <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded text-sm font-medium">
        Cloudinary is not configured yet. Upload disabled in Demo Mode.
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // 1. Get signature from backend
      const signRes = await fetch("/api/admin/cloudinary/sign?folder=seven-seas-cms");
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const signatureData = await signRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", signatureData.timestamp.toString());
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to Cloudinary");
      const cloudData = await uploadRes.json();

      // 3. Complete the upload and save to DB
      const completeRes = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cloudData),
      });

      if (!completeRes.ok) throw new Error("Failed to save media to database");
      
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*,video/*,application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={true} // Add drag and drop multiple files later, allow multiple select here for now if needed, though this logic only takes [0].
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UploadCloud className="w-4 h-4" />
        )}
        {isUploading ? "Uploading..." : "Upload Asset"}
      </button>
    </>
  );
}

