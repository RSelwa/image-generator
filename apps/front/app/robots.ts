import type { MetadataRoute } from "next"

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/*"],
    },
  }
}

export default robots
