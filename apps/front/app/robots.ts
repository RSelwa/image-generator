import { type MetadataRoute } from "next"

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/admin/*"],
  },
})

export default robots
