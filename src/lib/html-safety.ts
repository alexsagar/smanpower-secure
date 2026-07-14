const STRIP_BLOCK_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "meta",
  "link",
  "base",
];

function stripBlockedTags(html: string) {
  let sanitized = html;

  for (const tag of STRIP_BLOCK_TAGS) {
    sanitized = sanitized.replace(
      new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"),
      ""
    );
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"), "");
  }

  return sanitized;
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  return stripBlockedTags(html)
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/\ssrcdoc\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*(javascript:|vbscript:|data:text\/html)[^'"]*\2/gi, "")
    .trim();
}

export function getSafeExternalHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
