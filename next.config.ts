import type { NextConfig } from "next";
import { assertProductionEnv } from "./src/lib/env";
import { getSecurityHeaderConfig } from "./src/lib/security-headers";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

assertProductionEnv();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: cloudName ? `/${cloudName}/**` : "/**",
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
