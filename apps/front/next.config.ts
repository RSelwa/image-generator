import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/tiktok-generator-fa261.firebasestorage.app/**",
      },
      {
        protocol: "https",
        hostname: "www.game-guessr.com",
        pathname: "/**",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/proxy-image/**",
      },
    ]
  },
}

export default nextConfig
