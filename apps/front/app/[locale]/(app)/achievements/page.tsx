import { APP_BASE_URL, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { achievementDocSchema } from "@repo/schemas"
import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { connection } from "next/server"
import { AchievementsContent } from "@/app/[locale]/(app)/achievements/achievements-content"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations("achievements")

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false },
    alternates: {
      canonical: `${APP_BASE_URL}/${locale}/achievements`,
      languages: {
        en: `${APP_BASE_URL}/en/achievements`,
        fr: `${APP_BASE_URL}/fr/achievements`,
        "x-default": `${APP_BASE_URL}/en/achievements`,
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
      images: [{ url: "/opengraph-image.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [{ url: "/opengraph-image.jpg" }],
    },
  }
}

const getAchievements = async () => {
  const snapshot = await refs[TABLES.ACHIEVEMENTS].get()

  return snapshot.docs.flatMap((doc) => {
    const { data, error } = achievementDocSchema.safeParse(doc.data())

    if (error) {
      console.error(`Error parsing achievement: ${doc.id}`, error)

      return []
    }

    return [data]
  })
}

const AchievementsPage = async () => {
  await connection()
  const achievements = await getAchievements()

  return <AchievementsContent achievements={achievements} />
}

export default AchievementsPage
