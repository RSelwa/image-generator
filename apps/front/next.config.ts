import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  images: {
    localPatterns: [
      {
        pathname: "**",
      },
    ],
  },
}

export default nextConfig
