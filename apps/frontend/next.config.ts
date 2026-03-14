import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cubs/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
    ],
  },
};

export default nextConfig;
