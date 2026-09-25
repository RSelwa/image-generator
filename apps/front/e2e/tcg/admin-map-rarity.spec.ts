import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, CARD_TYPE, TABLES, USER_RIGHT } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type CardFields } from "@repo/schemas"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import {
  CARD_RARITY_FILTER,
  MODAL_KEYS,
  NO_CARD_RARITY,
} from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { formatCardNumber } from "@/utils/card-number"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { seedGameCard, seedMapCard } from "../helpers/tcg"

const CARD_NUMBER = 42
const DUPLICATE_CARD_NUMBER = 77

const seedMap = async () => {
  const game = gameFactory()
  const map = mapFactory({ gameId: game.id })
  await createFirestoreDoc(refs[TABLES.GAMES], game)
  await createFirestoreDoc(subRefs[TABLES.MAPS](game.id), map)

  return { gameId: game.id, mapId: map.id }
}

const seedCardMap = async (cardFields: CardFields) => {
  const game = gameFactory()
  await createFirestoreDoc(refs[TABLES.GAMES], game)
  const { map } = await seedMapCard(game.id, cardFields)

  return { gameId: game.id, mapId: map.id }
}

const getMapCards = async (mapId: string) => {
  const snapshot = await refs[TABLES.CARDS].where("mapId", "==", mapId).get()

  return snapshot.docs.map((card) => {
    const { type, gameId, rarity, number } = card.data()

    return { type, gameId, rarity, number }
  })
}

const getGameCards = async (gameId: string) => {
  const snapshot = await refs[TABLES.CARDS]
    .where("gameId", "==", gameId)
    .where("type", "==", CARD_TYPE.GAME)
    .get()

  return snapshot.docs.map((card) => {
    const { type, rarity, number } = card.data()

    return { type, rarity, number }
  })
}

const loginAsAdmin = async (page: Page) => {
  const admin = await setupUser()
  await refs[TABLES.RIGHTS]
    .doc(admin.id)
    .set({ uid: admin.id, right: USER_RIGHT.ADMIN })
  await loginViaUI(page, admin.email)
}

const openMapForm = async (page: Page, gameId: string, mapId: string) => {
  await loginAsAdmin(page)
  await page.goto(
    `/en${PAGES.ADMIN_MAPS}?${MODAL_KEYS.MAP_ID}=${gameId}_${mapId}`,
  )
}

const pickRarity = async (page: Page, rarity: string) => {
  await page.getByTestId(SELECTORS.MAP_FORM_CARD_RARITY).click()
  await page.getByTestId(SELECTORS.MAP_FORM_CARD_RARITY_OPTION(rarity)).click()
}

const submitMapForm = (page: Page) =>
  page.getByTestId(SELECTORS.MAP_FORM_SUBMIT).click()

test.describe("when an admin edits a map's card rarity", () => {
  for (const rarity of Object.values(CARD_RARITY)) {
    test(`should make the map a ${rarity} card`, async ({ page }) => {
      const { gameId, mapId } = await seedMap()

      await openMapForm(page, gameId, mapId)
      await pickRarity(page, rarity)
      await page
        .getByTestId(SELECTORS.MAP_FORM_CARD_NUMBER)
        .fill(String(CARD_NUMBER))
      await submitMapForm(page)

      await expect
        .poll(() => getMapCards(mapId))
        .toEqual([
          {
            type: CARD_TYPE.MAP,
            gameId,
            rarity,
            number: CARD_NUMBER,
          },
        ])
    })
  }

  test("should prefill the next free card number", async ({ page }) => {
    const { gameId, mapId } = await seedMap()

    await openMapForm(page, gameId, mapId)
    await pickRarity(page, CARD_RARITY.COMMON)
    const prefilledNumber = Number(
      await page.getByTestId(SELECTORS.MAP_FORM_CARD_NUMBER).inputValue(),
    )
    await submitMapForm(page)

    await expect
      .poll(() => getMapCards(mapId))
      .toEqual([
        {
          type: CARD_TYPE.MAP,
          gameId,
          rarity: CARD_RARITY.COMMON,
          number: prefilledNumber,
        },
      ])
  })

  test("should update the existing card", async ({ page }) => {
    const { gameId, mapId } = await seedCardMap({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })

    await openMapForm(page, gameId, mapId)
    await pickRarity(page, CARD_RARITY.LEGENDARY)
    await submitMapForm(page)

    await expect
      .poll(() => getMapCards(mapId))
      .toEqual([
        {
          type: CARD_TYPE.MAP,
          gameId,
          rarity: CARD_RARITY.LEGENDARY,
          number: CARD_NUMBER,
        },
      ])
  })

  test("should delete the card when set to not a card", async ({ page }) => {
    const { gameId, mapId } = await seedCardMap({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })

    await openMapForm(page, gameId, mapId)
    await pickRarity(page, NO_CARD_RARITY)
    await submitMapForm(page)

    await expect.poll(() => getMapCards(mapId)).toEqual([])
  })
})

test.describe("when an admin edits a game's card rarity", () => {
  const openGameForm = async (page: Page, gameId: string) => {
    await loginAsAdmin(page)
    await page.goto(`/en${PAGES.ADMIN_GAMES}?${MODAL_KEYS.GAME_ID}=${gameId}`)
  }

  const pickGameRarity = async (page: Page, rarity: string) => {
    await page.getByTestId(SELECTORS.GAME_FORM_CARD_RARITY).click()
    await page
      .getByTestId(SELECTORS.GAME_FORM_CARD_RARITY_OPTION(rarity))
      .click()
  }

  const seedGame = async () => {
    const game = gameFactory()
    await createFirestoreDoc(refs[TABLES.GAMES], game)

    return game.id
  }

  test("should make the game a card with the prefilled number", async ({
    page,
  }) => {
    const gameId = await seedGame()

    await openGameForm(page, gameId)
    await pickGameRarity(page, CARD_RARITY.RARE)
    const prefilledNumber = Number(
      await page.getByTestId(SELECTORS.GAME_FORM_CARD_NUMBER).inputValue(),
    )
    await page.getByTestId(SELECTORS.GAME_FORM_SUBMIT).click()

    await expect
      .poll(() => getGameCards(gameId))
      .toEqual([
        {
          type: CARD_TYPE.GAME,
          rarity: CARD_RARITY.RARE,
          number: prefilledNumber,
        },
      ])
  })

  test("should update the existing game card", async ({ page }) => {
    const gameId = await seedGame()
    await seedGameCard(gameId, {
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })

    await openGameForm(page, gameId)
    await pickGameRarity(page, CARD_RARITY.LEGENDARY)
    await page.getByTestId(SELECTORS.GAME_FORM_SUBMIT).click()

    await expect
      .poll(() => getGameCards(gameId))
      .toEqual([
        {
          type: CARD_TYPE.GAME,
          rarity: CARD_RARITY.LEGENDARY,
          number: CARD_NUMBER,
        },
      ])
  })
})

test.describe("when an admin filters the maps by rarity", () => {
  const filterBy = async (page: Page, filter: string) => {
    await page.getByTestId(SELECTORS.ADMIN_MAPS_RARITY_FILTER).click()
    await page
      .getByTestId(SELECTORS.ADMIN_MAPS_RARITY_FILTER_OPTION(filter))
      .click()
  }

  test("should show only the maps of that rarity", async ({ page }) => {
    const legendary = await seedCardMap({
      rarity: CARD_RARITY.LEGENDARY,
      number: CARD_NUMBER,
    })
    const unrated = await seedMap()

    await loginAsAdmin(page)
    await page.goto(`/en${PAGES.ADMIN_MAPS}`)
    await filterBy(page, CARD_RARITY.LEGENDARY)

    await expect(
      page.getByTestId(SELECTORS.MAP_CARD(legendary.mapId)),
    ).toBeVisible()
    await expect(
      page.getByTestId(SELECTORS.MAP_CARD(unrated.mapId)),
    ).toBeHidden()
  })

  test("should show only the maps left to rate", async ({ page }) => {
    const legendary = await seedCardMap({
      rarity: CARD_RARITY.LEGENDARY,
      number: CARD_NUMBER,
    })
    const unrated = await seedMap()

    await loginAsAdmin(page)
    await page.goto(`/en${PAGES.ADMIN_MAPS}`)
    await filterBy(page, CARD_RARITY_FILTER.NOT_RATED)

    await expect(
      page.getByTestId(SELECTORS.MAP_CARD(unrated.mapId)),
    ).toBeVisible()
    await expect(
      page.getByTestId(SELECTORS.MAP_CARD(legendary.mapId)),
    ).toBeHidden()
  })
})

test.describe("when two maps share a card number", () => {
  test("should flag the duplicate on the admin maps page", async ({ page }) => {
    await seedCardMap({
      rarity: CARD_RARITY.RARE,
      number: DUPLICATE_CARD_NUMBER,
    })
    await seedCardMap({
      rarity: CARD_RARITY.RARE,
      number: DUPLICATE_CARD_NUMBER,
    })

    await loginAsAdmin(page)
    await page.goto(`/en${PAGES.ADMIN_MAPS}`)

    await expect(
      page.getByTestId(SELECTORS.ADMIN_MAPS_DUPLICATE_NUMBERS),
    ).toContainText(formatCardNumber(DUPLICATE_CARD_NUMBER))
  })
})
