import { APP_BASE_URL, METADATA_DOCS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { cardDocSchema, gamesListDocSchema } from "@repo/schemas"
import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { connection } from "next/server"
import { PAGES } from "@/constants/pages"
import { routing } from "@/i18n/routing"
import { getCardSubject, getCardSubjectRef } from "@/utils/card-subject"
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

const getCardDocs = async () => {
  const cardsSnapshot = await refs[TABLES.CARDS].get()

  return cardsSnapshot.docs.flatMap((snapshot) => {
    const card = cardDocSchema.safeParse(snapshot.data()).data

    return card ? [{ cardId: snapshot.id, card }] : []
  })
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
  const [cardDocs, gameTitles] = await Promise.all([
    getCardDocs(),
    getGameTitles(),
  ])

  const subjectSnapshots =
    cardDocs.length > 0
      ? await db.getAll(...cardDocs.map(({ card }) => getCardSubjectRef(card)))
      : []

  const cards = cardDocs.flatMap(({ cardId, card }, index) => {
    const subject = getCardSubject(card, subjectSnapshots[index]?.data())

    if (!subject) return []

    return [
      {
        cardId,
        type: card.type,
        gameId: card.gameId,
        rarity: card.rarity,
        number: card.number,
        ...subject,
      },
    ]
  })

  return <CollectionContent cards={cards} gameTitles={gameTitles} />
}

export default CollectionPage
