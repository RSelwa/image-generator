import { APP_BASE_URL } from "@repo/common"
import { type MetadataRoute } from "next"
import { BLOG_POSTS } from "@/constants/blog"
import { FIRST_DAY } from "@/constants/daily-challenges"

const LOCALES = ["en", "fr"]

const getDailyChallengeDates = (): string[] => {
  const dates: string[] = []
  const start = new Date(FIRST_DAY)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const current = new Date(start)
  while (current <= today) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export default (): MetadataRoute.Sitemap => {
  const staticPaths = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/login", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/signup", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/daily-challenge", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
  ]

  const blogSlugs = Object.values(BLOG_POSTS).map((post) => post.slug)
  const dailyDates = getDailyChallengeDates()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const { path, priority, changeFrequency } of staticPaths) {
      entries.push({
        url: `${APP_BASE_URL}/${locale}${path}`,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            ...Object.fromEntries(LOCALES.map((l) => [l, `${APP_BASE_URL}/${l}${path}`])),
            "x-default": `${APP_BASE_URL}/en${path}`,
          },
        },
      })
    }

    for (const slug of blogSlugs) {
      entries.push({
        url: `${APP_BASE_URL}/${locale}/blog/${slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: {
            ...Object.fromEntries(LOCALES.map((l) => [l, `${APP_BASE_URL}/${l}/blog/${slug}`])),
            "x-default": `${APP_BASE_URL}/en/blog/${slug}`,
          },
        },
      })
    }

    for (const date of dailyDates) {
      entries.push({
        url: `${APP_BASE_URL}/${locale}/daily-challenge/${date}`,
        changeFrequency: "never",
        priority: 0.6,
        alternates: {
          languages: {
            ...Object.fromEntries(LOCALES.map((l) => [l, `${APP_BASE_URL}/${l}/daily-challenge/${date}`])),
            "x-default": `${APP_BASE_URL}/en/daily-challenge/${date}`,
          },
        },
      })
    }
  }

  return entries
}
