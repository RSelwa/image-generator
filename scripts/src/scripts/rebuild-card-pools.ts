import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { buildCardPools, cardDocSchema } from "@repo/schemas"

const cardsSnapshot = await refs[TABLES.CARDS].get()

const pools = buildCardPools(
  cardsSnapshot.docs.flatMap((snapshot) => {
    const card = cardDocSchema.safeParse(snapshot.data()).data

    return card
      ? [
          {
            cardId: snapshot.id,
            gameId: card.gameId,
            cardProperties: card.cardProperties,
          },
        ]
      : []
  }),
)

await Promise.all(
  pools.map(({ rarity, pool }) =>
    refs[TABLES.CARD_POOLS].doc(rarity).set(pool),
  ),
)

pools.forEach(({ rarity, pool }) => {
  console.info(`${rarity}: ${pool.cards.length} cards`)
})
