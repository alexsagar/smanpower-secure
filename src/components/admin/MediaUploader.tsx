"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  MEDIA_PURPOSE_MAP,
  type MediaPurpose,
  getAcceptAttributeForPurpose,
} from "@/lib/media-purposes";

export function MediaUploader({
  purpose = "cms_image",
}: {
  purpose?: MediaPurpose;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const config = MEDIA_PURPOSE_MAP[purpose];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const signRes = await fetch(`/api/admin/cloudinary/sign?purpose=${purpose}`);
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const signatureData = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", String(signatureData.timestamp));
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) throw new Error("Failed to upload to Cloudinary");
      const cloudData = await uploadRes.json();

      const completeRes = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: cloudData.public_id,
          original_filename: file.name,
          purpose,
        }),
      });

      if (!completeRes.ok) {
        const errorData = await completeRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save media");
      }

      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Upload failed";
      alert(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept={getAcceptAttributeForPurpose(purpose)}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50"
        title={`Upload to ${config.folder}`}
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
