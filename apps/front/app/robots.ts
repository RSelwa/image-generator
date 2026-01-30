import { type MetadataRoute } from "next"

function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/*"],
    },
  }
}

export default robots
