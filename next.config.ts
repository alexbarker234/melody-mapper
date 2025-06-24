import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.scdn.co"
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com"
      }
    ]
  }
};

export default nextConfig;
