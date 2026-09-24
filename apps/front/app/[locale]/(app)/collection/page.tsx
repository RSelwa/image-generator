import { APP_BASE_URL, METADATA_DOCS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import {
  cardPoolDocSchema,
  gamesListDocSchema,
  mapDocSchema,
} from "@repo/schemas"
import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { connection } from "next/server"
import { PAGES } from "@/constants/pages"
import { routing } from "@/i18n/routing"
import { CollectionContent } from "@/app/[locale]/(app)/collection/collection-content"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations("collection")

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false },
    alternates: {
      canonical: `${APP_BASE_URL}/${locale}${PAGES.COLLECTION}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((routingLocale) => [
            routingLocale,
            `${APP_BASE_URL}/${routingLocale}${PAGES.COLLECTION}`,
          ]),
        ),
        "x-default": `${APP_BASE_URL}/${routing.defaultLocale}${PAGES.COLLECTION}`,
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

const getPoolEntries = async () => {
  const poolsSnapshot = await refs[TABLES.CARD_POOLS].get()

  return poolsSnapshot.docs.flatMap(
    (pool) => cardPoolDocSchema.safeParse(pool.data()).data?.maps || [],
  )
}

const getGameTitles = async () => {
  const gamesList = await refs[TABLES.METADATA]
    .doc(METADATA_DOCS.GAMES_LIST)
    .get()
  const games = gamesListDocSchema.safeParse(gamesList.data()).data?.games || []

  return Object.fromEntries(games.map(({ id, title }) => [id, title]))
}

const CollectionPage = async () => {
  await connection()
  const [poolEntries, gameTitles] = await Promise.all([
    getPoolEntries(),
    getGameTitles(),
  ])

  const mapSnapshots =
    poolEntries.length > 0
      ? await db.getAll(
          ...poolEntries.map(({ gameId, mapId }) =>
            subRefs[TABLES.MAPS](gameId).doc(mapId),
          ),
        )
      : []

  const cards = poolEntries.flatMap((entry, index) => {
    const map = mapDocSchema.safeParse(mapSnapshots[index]?.data()).data

    if (!map?.cardProperties) return []

    return [
      {
        ...entry,
        ...map.cardProperties,
        name: map.name,
        imageUrl: map.imageUrl || null,
      },
    ]
  })

  return <CollectionContent cards={cards} gameTitles={gameTitles} />
}

export default CollectionPage
