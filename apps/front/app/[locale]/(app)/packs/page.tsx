import { APP_BASE_URL } from "@repo/common"
import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PAGES } from "@/constants/pages"
import { routing } from "@/i18n/routing"
import { PacksContent } from "@/app/[locale]/(app)/packs/packs-content"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations("packs")

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false },
    alternates: {
      canonical: `${APP_BASE_URL}/${locale}${PAGES.PACKS}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((routingLocale) => [
            routingLocale,
            `${APP_BASE_URL}/${routingLocale}${PAGES.PACKS}`,
          ]),
        ),
        "x-default": `${APP_BASE_URL}/${routing.defaultLocale}${PAGES.PACKS}`,
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

const PacksPage = () => <PacksContent />

export default PacksPage
