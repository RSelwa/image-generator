import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, TABLES, USER_RIGHT } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type CardProperties } from "@repo/schemas"
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

const CARD_NUMBER = 42
const DUPLICATE_CARD_NUMBER = 77

const seedMap = async (cardProperties?: CardProperties) => {
  const game = gameFactory()
  const map = mapFactory({ gameId: game.id, cardProperties })
  await createFirestoreDoc(refs[TABLES.GAMES], game)
  await createFirestoreDoc(subRefs[TABLES.MAPS](game.id), map)

  return { gameId: game.id, mapId: map.id }
}

const getCardProperties = async (gameId: string, mapId: string) => {
  const snapshot = await subRefs[TABLES.MAPS](gameId).doc(mapId).get()

  return snapshot.data()?.cardProperties
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
        .poll(() => getCardProperties(gameId, mapId))
        .toEqual({ rarity, number: CARD_NUMBER })
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
      .poll(() => getCardProperties(gameId, mapId))
      .toEqual({ rarity: CARD_RARITY.COMMON, number: prefilledNumber })
  })

  test("should remove the card properties when set to not a card", async ({
    page,
  }) => {
    const { gameId, mapId } = await seedMap({
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })

    await openMapForm(page, gameId, mapId)
    await pickRarity(page, NO_CARD_RARITY)
    await submitMapForm(page)

    await expect.poll(() => getCardProperties(gameId, mapId)).toBeUndefined()
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
    const legendary = await seedMap({
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
    const legendary = await seedMap({
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
    await seedMap({ rarity: CARD_RARITY.RARE, number: DUPLICATE_CARD_NUMBER })
    await seedMap({ rarity: CARD_RARITY.RARE, number: DUPLICATE_CARD_NUMBER })

    await loginAsAdmin(page)
    await page.goto(`/en${PAGES.ADMIN_MAPS}`)

    await expect(
      page.getByTestId(SELECTORS.ADMIN_MAPS_DUPLICATE_NUMBERS),
    ).toContainText(formatCardNumber(DUPLICATE_CARD_NUMBER))
  })
})
