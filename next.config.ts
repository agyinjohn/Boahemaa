import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    // Allow news images and video files to be uploaded through server actions.
    serverActions: { bodySizeLimit: "100mb" },
  },
};

export default nextConfig;
