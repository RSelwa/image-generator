import { APP_BASE_URL, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { achievementSchema } from "@repo/schemas"
import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { connection } from "next/server"
import { PAGES } from "@/constants/pages"
import { routing } from "@/i18n/routing"
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
      canonical: `${APP_BASE_URL}/${locale}${PAGES.ACHIEVEMENTS}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((routingLocale) => [
            routingLocale,
            `${APP_BASE_URL}/${routingLocale}${PAGES.ACHIEVEMENTS}`,
          ]),
        ),
        "x-default": `${APP_BASE_URL}/${routing.defaultLocale}${PAGES.ACHIEVEMENTS}`,
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

const AchievementsPage = async () => {
  await connection()
  const snapshot = await refs[TABLES.ACHIEVEMENTS].get()

  const achievements = snapshot.docs.flatMap((doc) => {
    const { data, error } = achievementSchema.safeParse({
      key: doc.id,
      ...doc.data(),
    })

    if (error) {
      console.error(`Error parsing achievement: ${doc.id}`, error)

      return []
    }

    return [data]
  })

  return <AchievementsContent achievements={achievements} />
}

export default AchievementsPage
