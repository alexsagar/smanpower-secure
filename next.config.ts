import type { NextConfig } from "next";
import { assertProductionEnv } from "./src/lib/env";
import { getSecurityHeaderConfig } from "./src/lib/security-headers";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

assertProductionEnv();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // /_next/image was answering with no cache lifetime at all, so every
    // navigation re-downloaded optimised images. One year is safe: the URL is
    // keyed on the source path plus the transform params.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: cloudName ? `/${cloudName}/**` : "/**",
      },
      {
        protocol: "https",
        hostname: "media.smanpower.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return getSecurityHeaderConfig();
  },
  // Strip the legacy /en and /ne locale prefixes. Was proxy.ts, but Next 16 proxy is
  // Node.js-runtime only and OpenNext/Workers cannot run it.
  async redirects() {
    return [
      // Verified legacy permanent redirects
      { source: "/page/about-us", destination: "/about", permanent: true },
      { source: "/page/we-supply", destination: "/industries", permanent: true },
      { source: "/page/recruitment-process", destination: "/employers", permanent: true },
      { source: "/page/demand-list", destination: "/demands", permanent: true },
      { source: "/page/re-advertisement", destination: "/demands", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/document", destination: "/trust-centre", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/jobs", destination: "/demands", permanent: true },

      // Strip the legacy /en and /ne locale prefixes
      { source: "/:locale(en|ne)", destination: "/", permanent: false },
      {
        source: "/:locale(en|ne)/:path*",
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
