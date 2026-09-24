import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, TABLES, USER_RIGHT } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type CardProperties } from "@repo/schemas"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { MODAL_KEYS, NO_CARD_RARITY } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"

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

const openMapForm = async (page: Page, gameId: string, mapId: string) => {
  const admin = await setupUser()
  await refs[TABLES.RIGHTS]
    .doc(admin.id)
    .set({ uid: admin.id, right: USER_RIGHT.ADMIN })
  await loginViaUI(page, admin.email)
  await page.goto(
    `/en${PAGES.ADMIN_MAPS}?${MODAL_KEYS.MAP_ID}=${gameId}_${mapId}`,
  )
}

const pickRarity = async (page: Page, rarity: string) => {
  await page.getByTestId(SELECTORS.MAP_FORM_CARD_RARITY).click()
  await page.getByTestId(SELECTORS.MAP_FORM_CARD_RARITY_OPTION(rarity)).click()
  await page.getByTestId(SELECTORS.MAP_FORM_SUBMIT).click()
}

test.describe("when an admin edits a map's card rarity", () => {
  for (const rarity of Object.values(CARD_RARITY)) {
    test(`should make the map a ${rarity} card`, async ({ page }) => {
      const { gameId, mapId } = await seedMap()

      await openMapForm(page, gameId, mapId)
      await pickRarity(page, rarity)

      await expect
        .poll(() => getCardProperties(gameId, mapId))
        .toEqual({ rarity })
    })
  }

  test("should remove the card properties when set to not a card", async ({
    page,
  }) => {
    const { gameId, mapId } = await seedMap({ rarity: CARD_RARITY.RARE })

    await openMapForm(page, gameId, mapId)
    await pickRarity(page, NO_CARD_RARITY)

    await expect.poll(() => getCardProperties(gameId, mapId)).toBeUndefined()
  })
})
