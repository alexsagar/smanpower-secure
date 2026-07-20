"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  MEDIA_PURPOSE_MAP,
  type MediaPurpose,
  getAcceptAttributeForPurpose,
} from "@/lib/media-purposes";

export function canStartMediaUpload(isUploading: boolean, file: File | null | undefined) {
  return Boolean(file) && !isUploading;
}

type SignedUploadResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: "image" | "video" | "raw";
};

export function buildCloudinaryUploadUrl(signatureData: SignedUploadResponse): string {
  return `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`;
}

export async function getSafeCloudinaryUploadErrorMessage(
  response: Response
): Promise<string> {
  const fallback = "Cloudinary upload failed. Please verify the file type and try again.";
  const data = await response.json().catch(() => null) as
    | { error?: { message?: unknown } | string }
    | null;

  if (data && typeof data.error === "object" && data.error) {
    const message = data.error.message;
    if (typeof message === "string" && message.trim()) {
      return `Cloudinary upload failed: ${message.trim()}`;
    }
  }

  if (data && typeof data.error === "string" && data.error.trim()) {
    return `Cloudinary upload failed: ${data.error.trim()}`;
  }

  return fallback;
}

export function MediaUploader({
  purpose = "cms_image",
  onUploadComplete,
}: {
  purpose?: MediaPurpose;
  onUploadComplete?: (media: unknown) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const config = MEDIA_PURPOSE_MAP[purpose];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!canStartMediaUpload(isUploading, file)) return;
    const selectedFile = file as File;

    setIsUploading(true);
    setCurrentFileName(selectedFile.name);
    setStatus("idle");
    setMessage(null);

    try {
      const signRes = await fetch(`/api/admin/cloudinary/sign?purpose=${purpose}`);
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const signatureData = await signRes.json() as SignedUploadResponse;

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", String(signatureData.timestamp));
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);

      const uploadRes = await fetch(
        buildCloudinaryUploadUrl(signatureData),
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error(await getSafeCloudinaryUploadErrorMessage(uploadRes));
      }
      const cloudData = await uploadRes.json();

      const completeRes = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: cloudData.public_id,
          original_filename: selectedFile.name,
          purpose,
        }),
      });

      if (!completeRes.ok) {
        const errorData = await completeRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save media");
      }
      const completeData = await completeRes.json();

      setStatus("success");
      setMessage(`${selectedFile.name} uploaded.`);
      onUploadComplete?.(completeData.media);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Upload failed";
      setStatus("error");
      setMessage(message);
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
        disabled={isUploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-busy={isUploading}
        aria-describedby={message || currentFileName ? "media-upload-status" : undefined}
        className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50"
        title={`Upload to ${config.folder}`}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 motion-safe:animate-spin motion-reduce:animate-none" />
        ) : (
          <UploadCloud className="w-4 h-4" />
        )}
        {isUploading ? "Uploading..." : "Upload Asset"}
      </button>
      {(isUploading || message || currentFileName) && (
        <p
          id="media-upload-status"
          className={`mt-2 text-xs ${
            status === "error"
              ? "text-red-600"
              : status === "success"
              ? "text-emerald-700"
              : "text-gray-500"
          }`}
          role="status"
          aria-live="polite"
        >
          {isUploading && currentFileName ? `Uploading ${currentFileName}...` : message}
        </p>
      )}
    </>
  );
}
