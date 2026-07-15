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
};

export default nextConfig;
