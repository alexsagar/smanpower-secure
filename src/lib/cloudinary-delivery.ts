type ImageDeliveryOptions = { width?: number; height?: number; trim?: boolean };

/** Add safe, non-destructive image delivery transforms without changing CMS URLs. */
export function getCloudinaryImageUrl(src: string, { width, height, trim }: ImageDeliveryOptions = {}) {
  try {
    const url = new URL(src);
    const parts = url.pathname.split("/");
    const uploadIndex = parts.findIndex((part, index) => part === "image" && parts[index + 1] === "upload");
    if (url.hostname !== "res.cloudinary.com" || uploadIndex < 0) return src;

    const versionIndex = parts.findIndex((part, index) => index > uploadIndex + 1 && /^v\d+$/.test(part));
    const transformEnd = versionIndex < 0 ? parts.length : versionIndex;
    const existing = parts.slice(uploadIndex + 2, transformEnd).join(",");
    const additions = [
      // Trim uniform/transparent padding baked into the source (e.g. logo whitespace).
      trim && !/(^|,)e_trim(:|,|$)/.test(existing) && "e_trim",
      !/(^|,)f_auto(,|$)/.test(existing) && "f_auto",
      !/(^|,)q_auto(?::[^,]+)?(,|$)/.test(existing) && "q_auto",
      !(width || height) ? false : !/(^|,)c_(fit|limit)(,|$)/.test(existing) && "c_limit",
      width && !new RegExp(`(^|,)w_${width}(,|$)`).test(existing) && `w_${width}`,
      height && !new RegExp(`(^|,)h_${height}(,|$)`).test(existing) && `h_${height}`,
    ].filter(Boolean);
    if (additions.length) parts.splice(uploadIndex + 2, 0, additions.join(","));
    url.pathname = parts.join("/");
    return url.toString();
  } catch {
    return src;
  }
}
