import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { cardDocSchema } from "@repo/schemas"
import { gameFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { formatCardNumber } from "@/utils/card-number"
import { getCardSubjectRef } from "@/utils/card-subject"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { enableTcgFlag, seedGameCard, seedMapCard } from "../helpers/tcg"

const LOCKED_CARD_NUMBER = 42
const OWNED_CARD_NUMBER = 43
const OWNED_CARD_PROPERTIES = {
  rarity: CARD_RARITY.LEGENDARY,
  number: OWNED_CARD_NUMBER,
}
const OWNED_COUNT = 2
const GAME_CARD_NUMBER = 44

const seedGameWithTwoCards = async () => {
  const game = gameFactory()
  await refs[TABLES.GAMES].doc(game.id).set(game)
  const ownedCard = await seedMapCard(game.id, OWNED_CARD_PROPERTIES)
  const lockedCard = await seedMapCard(game.id, {
    rarity: CARD_RARITY.COMMON,
    number: LOCKED_CARD_NUMBER,
  })

  return { game, gameId: game.id, ownedCard, lockedCard }
}

const openCollectionOwning = async (
  page: Page,
  cardId: string,
  gameId: string,
) => {
  const user = await setupUser()
  await subRefs[TABLES.CARDS](user.id).doc(cardId).set({
    cardId,
    gameId,
    count: OWNED_COUNT,
    cardPropertiesAtPull: OWNED_CARD_PROPERTIES,
    firstPulledAt: Timestamp.now(),
    lastPulledAt: Timestamp.now(),
  })
  await enableTcgFlag(page)
  await loginViaUI(page, user.email)
  await page.goto(`/en${PAGES.COLLECTION}`)
}

test.describe.configure({ mode: "serial" })

test.describe("when a user opens their collection", () => {
  test("should show the owned and locked cards with their number", async ({
    page,
  }) => {
    const { gameId, ownedCard, lockedCard } = await seedGameWithTwoCards()

    await openCollectionOwning(page, ownedCard.cardId, gameId)

    await expect(
      page.getByTestId(SELECTORS.COLLECTION_GAME_PROGRESS(gameId)),
    ).toHaveText("1/2")
    await expect(
      page.getByTestId(SELECTORS.TRADING_CARD(ownedCard.cardId)),
    ).toContainText(formatCardNumber(OWNED_CARD_NUMBER))
    await expect(
      page.getByTestId(SELECTORS.COLLECTION_LOCKED_CARD(lockedCard.cardId)),
    ).toContainText(formatCardNumber(LOCKED_CARD_NUMBER))
  })

  test("should order the cards by number rather than rarity", async ({
    page,
  }) => {
    const { gameId, ownedCard, lockedCard } = await seedGameWithTwoCards()

    await openCollectionOwning(page, ownedCard.cardId, gameId)

    await expect
      .poll(() =>
        page
          .getByTestId(SELECTORS.COLLECTION_GAME(gameId))
          .locator("li > [data-testid]")
          .evaluateAll((cards) =>
            cards.map((card) => card.getAttribute("data-testid")),
          ),
      )
      .toEqual([
        SELECTORS.COLLECTION_LOCKED_CARD(lockedCard.cardId),
        SELECTORS.TRADING_CARD(ownedCard.cardId),
      ])
  })

  test("should show the game card first in its game", async ({ page }) => {
    const { game, gameId, ownedCard, lockedCard } = await seedGameWithTwoCards()
    const gameCardId = await seedGameCard(gameId, {
      rarity: CARD_RARITY.RARE,
      number: GAME_CARD_NUMBER,
    })

    await openCollectionOwning(page, gameCardId, gameId)

    await expect(
      page.getByTestId(SELECTORS.TRADING_CARD(gameCardId)),
    ).toContainText(game.title)
    await expect
      .poll(() =>
        page
          .getByTestId(SELECTORS.COLLECTION_GAME(gameId))
          .locator("li > [data-testid]")
          .evaluateAll((cards) =>
            cards.map((card) => card.getAttribute("data-testid")),
          ),
      )
      .toEqual([
        SELECTORS.TRADING_CARD(gameCardId),
        SELECTORS.COLLECTION_LOCKED_CARD(lockedCard.cardId),
        SELECTORS.COLLECTION_LOCKED_CARD(ownedCard.cardId),
      ])
  })

  test("should show the overall collection progress", async ({ page }) => {
    const { gameId, ownedCard } = await seedGameWithTwoCards()
    const cardsSnapshot = await refs[TABLES.CARDS].get()
    const cards = cardsSnapshot.docs.flatMap((snapshot) => {
      const card = cardDocSchema.safeParse(snapshot.data()).data

      return card ? [card] : []
    })
    const subjects = await db.getAll(...cards.map(getCardSubjectRef))

    const total = subjects.filter((subject) => subject.exists).length

    await openCollectionOwning(page, ownedCard.cardId, gameId)

    await expect(page.getByTestId(SELECTORS.COLLECTION_PROGRESS)).toContainText(
      `1/${total}`,
    )
  })
})
