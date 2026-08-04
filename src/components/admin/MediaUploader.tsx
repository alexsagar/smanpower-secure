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

/** Files picked in one go, in the order the browser reported them. */
export function selectedUploadFiles(list: FileList | null | undefined): File[] {
  return list ? Array.from(list) : [];
}

/**
 * Progress label for a batch. A single file keeps the original wording so the
 * common case reads no differently than before.
 */
export function uploadProgressLabel(fileName: string, index: number, total: number): string {
  return total > 1
    ? `Uploading ${fileName} (${index + 1} of ${total})...`
    : `Uploading ${fileName}...`;
}

/**
 * Outcome summary for a batch. Partial failure is reported explicitly: the
 * successful files are already saved, so silently showing only an error would
 * misrepresent what happened.
 */
export function uploadSummaryMessage(succeeded: string[], failed: string[]): string {
  if (failed.length === 0) {
    return succeeded.length === 1
      ? `${succeeded[0]} uploaded.`
      : `${succeeded.length} files uploaded.`;
  }

  if (succeeded.length === 0) {
    return failed.length === 1 ? `${failed[0]} failed.` : `All ${failed.length} files failed.`;
  }

  return `${succeeded.length} uploaded, ${failed.length} failed (${failed.join(", ")}).`;
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
  multiple = false,
}: {
  purpose?: MediaPurpose;
  onUploadComplete?: (media: unknown) => void;
  /** Allow picking several files at once; they upload one after another. */
  multiple?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const config = MEDIA_PURPOSE_MAP[purpose];

  /**
   * One file, end to end. Each file gets its own signature and its own
   * server-side verification in /api/admin/media/complete — batching changes
   * how many times this runs, never what it checks.
   */
  const uploadOne = async (file: File): Promise<unknown> => {
    const signRes = await fetch(`/api/admin/cloudinary/sign?purpose=${purpose}`);
    if (!signRes.ok) throw new Error("Failed to get upload signature");
    const signatureData = await signRes.json() as SignedUploadResponse;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);

    const uploadRes = await fetch(buildCloudinaryUploadUrl(signatureData), {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error(await getSafeCloudinaryUploadErrorMessage(uploadRes));
    }
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

    return (await completeRes.json()).media;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = selectedUploadFiles(e.target.files);
    if (!canStartMediaUpload(isUploading, files[0])) return;

    setIsUploading(true);
    setStatus("idle");
    setMessage(null);

    const succeeded: string[] = [];
    const failed: string[] = [];
    let lastError: string | null = null;

    // Sequential on purpose: each file needs its own signature, and firing a
    // whole batch at once risks rate limiting. One slow file must not abort the
    // rest, so each is caught individually and the batch always finishes.
    for (const [index, file] of files.entries()) {
      setCurrentFileName(uploadProgressLabel(file.name, index, files.length));
      try {
        const media = await uploadOne(file);
        succeeded.push(file.name);
        onUploadComplete?.(media);
      } catch (error: unknown) {
        failed.push(file.name);
        lastError = error instanceof Error ? error.message : "Upload failed";
      }
    }

    setStatus(failed.length === 0 ? "success" : "error");
    setMessage(
      files.length === 1 && failed.length === 1
        ? lastError
        : uploadSummaryMessage(succeeded, failed)
    );
    setCurrentFileName(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (succeeded.length > 0) router.refresh();
  };

  return (
    <>
      <input
        type="file"
        accept={getAcceptAttributeForPurpose(purpose)}
        multiple={multiple}
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
        {isUploading ? "Uploading..." : multiple ? "Upload Assets" : "Upload Asset"}
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
          {isUploading && currentFileName ? currentFileName : message}
        </p>
      )}
    </>
  );
}
