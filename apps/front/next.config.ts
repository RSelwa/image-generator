import createNextIntlPlugin from "next-intl/plugin"
import { type NextConfig } from "next"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
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
