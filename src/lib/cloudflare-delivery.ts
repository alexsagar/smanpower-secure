import { MediaPresetConfig } from "./media-presets";

const R2_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_DOMAIN || "https://media.smanpower.com";

export function getCloudflareImageUrl(
  storageKey: string,
  preset?: MediaPresetConfig,
  fill?: boolean
): string {
  if (!preset) {
    return `${R2_BASE_URL}/${storageKey}`;
  }

  const options: string[] = [];
  options.push("format=auto");

  if (preset.width) {
    options.push(`width=${preset.width}`);
  }

  const usePresetBox = !fill && preset.height !== undefined;
  if (usePresetBox) {
    options.push(`height=${preset.height}`);
  }

  if (preset.crop === "fill") {
    options.push("fit=cover");
  } else if (preset.crop === "limit") {
    options.push("fit=contain");
  } else {
    options.push("fit=contain");
  }

  if (preset.gravity && preset.gravity === "face") {
    options.push("gravity=auto"); 
  } else if (preset.gravity) {
    options.push(`gravity=${preset.gravity}`);
  }

  if (preset.quality.includes("best")) {
    options.push("quality=95");
  } else if (preset.quality.includes("good")) {
    options.push("quality=85");
  } else {
    options.push("quality=auto");
  }

  const optionsStr = options.join(",");
  const cleanKey = storageKey.startsWith("/") ? storageKey.substring(1) : storageKey;
  
  return `${R2_BASE_URL}/cdn-cgi/image/${optionsStr}/${cleanKey}`;
}

export function getCloudflareVideoUrl(storageKey: string): string {
  const cleanKey = storageKey.startsWith("/") ? storageKey.substring(1) : storageKey;
  return `${R2_BASE_URL}/${cleanKey}`;
}

export function getCloudflareDocumentUrl(storageKey: string): string {
  const cleanKey = storageKey.startsWith("/") ? storageKey.substring(1) : storageKey;
  return `${R2_BASE_URL}/${cleanKey}`;
}
