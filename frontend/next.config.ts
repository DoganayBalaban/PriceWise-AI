import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.dsmcdn.com" },
      { protocol: "https", hostname: "**.hepsiburada.net" },
    ],
  },
};

export default nextConfig;
