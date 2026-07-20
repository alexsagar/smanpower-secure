import { isStagingNoIndexEnabled } from "./env";

export function getSecurityHeaderEntries() {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com",
    "connect-src 'self' https:",
    "frame-src 'self' https://challenges.cloudflare.com https://translate.google.com",
  ].join("; ");

  const headers = [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
  ];

  if (isStagingNoIndexEnabled()) {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  }

  return headers;
}

export function getSecurityHeaderConfig() {
  return [
    {
      source: "/:path*",
      headers: getSecurityHeaderEntries(),
    },
    {
      source: "/api/documents/:path*",
      headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
    },
    {
      source: "/api/admin/private-media-url",
      headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
    },
  ];
}
