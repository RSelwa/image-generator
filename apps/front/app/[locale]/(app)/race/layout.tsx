import { APP_BASE_URL } from "@repo/common"
import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations("racePage")

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${APP_BASE_URL}/${locale}/race`,
      languages: {
        en: `${APP_BASE_URL}/en/race`,
        fr: `${APP_BASE_URL}/fr/race`,
        "x-default": `${APP_BASE_URL}/en/race`,
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

const RaceLayout = ({ children }: { children: React.ReactNode }) => children

export default RaceLayout
