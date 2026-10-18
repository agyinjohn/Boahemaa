import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow news images and video files to be uploaded through server actions.
    serverActions: { bodySizeLimit: "100mb" },
  },
};

export default nextConfig;
