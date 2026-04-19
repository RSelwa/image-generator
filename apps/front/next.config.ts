import { type NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  experimental: {
    cpus: 1,
  },
  images: {
    unoptimized: true,
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
      { pathname: "/**" },
    ],
  },
}

export default withNextIntl(nextConfig)
