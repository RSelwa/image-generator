import { expect, type Page, test } from "@playwright/test"
import { CARD_RARITY, CARD_TYPE, TABLES, USER_RIGHT } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { SELECTORS } from "@/constants/testing"
import { loginViaUI, setupUser } from "../helpers/lobby"
import { seedMapCard } from "../helpers/tcg"

const CARD_NUMBER = 42
const EDITED_CARD_NUMBER = 43

const seedGame = async () => {
  const game = gameFactory()
  await createFirestoreDoc(refs[TABLES.GAMES], game)

  return game
}

const getCard = async (cardId: string) => {
  const snapshot = await refs[TABLES.CARDS].doc(cardId).get()

  return snapshot.data()
}

const getCardsOfGame = async (gameId: string) => {
  const snapshot = await refs[TABLES.CARDS].where("gameId", "==", gameId).get()

  return snapshot.docs.map((card) => card.data())
}

const openAdminCards = async (page: Page) => {
  const admin = await setupUser()
  await refs[TABLES.RIGHTS]
    .doc(admin.id)
    .set({ uid: admin.id, right: USER_RIGHT.ADMIN })
  await loginViaUI(page, admin.email)
  await page.getByTestId(SELECTORS.NAV_USER_DROPDOWN_TRIGGER).click()
  await page.getByTestId(SELECTORS.ADMIN_MENU_TRIGGER).click()
  await page.getByTestId(SELECTORS.ADMIN_MENU_CARDS).click()
}

const pickOption = async (page: Page, trigger: string, option: string) => {
  await page.getByTestId(trigger).click()
  await page.getByTestId(option).click()
}

const fillCardProperties = async (
  page: Page,
  rarity: string,
  number: number,
) => {
  await pickOption(
    page,
    SELECTORS.CARD_FORM_RARITY,
    SELECTORS.CARD_FORM_RARITY_OPTION(rarity),
  )
  await page.getByTestId(SELECTORS.CARD_FORM_NUMBER).fill(String(number))
}

test.describe("when an admin manages cards", () => {
  test("should list the existing cards", async ({ page }) => {
    const game = await seedGame()
    const { cardId } = await seedMapCard(game.id, {
      rarity: CARD_RARITY.RARE,
      number: CARD_NUMBER,
    })

    await openAdminCards(page)

    await expect(
      page.getByTestId(SELECTORS.ADMIN_CARD_ROW(cardId)),
    ).toBeVisible()
  })

  test("should create a map card", async ({ page }) => {
    const game = await seedGame()
    const map = mapFactory({ gameId: game.id })
    await createFirestoreDoc(subRefs[TABLES.MAPS](game.id), map)

    await openAdminCards(page)
    await page.getByTestId(SELECTORS.ADMIN_CARD_NEW).click()
    await pickOption(
      page,
      SELECTORS.CARD_FORM_GAME,
      SELECTORS.CARD_FORM_GAME_OPTION(game.id),
    )
    await pickOption(
      page,
      SELECTORS.CARD_FORM_MAP,
      SELECTORS.CARD_FORM_MAP_OPTION(map.id),
    )
    await fillCardProperties(page, CARD_RARITY.LEGENDARY, CARD_NUMBER)
    await page.getByTestId(SELECTORS.CARD_FORM_SUBMIT).click()

    await expect
      .poll(() => getCardsOfGame(game.id))
      .toMatchObject([
        {
          type: CARD_TYPE.MAP,
          mapId: map.id,
          cardProperties: {
            rarity: CARD_RARITY.LEGENDARY,
            number: CARD_NUMBER,
          },
        },
      ])
  })

  test("should create a game card", async ({ page }) => {
    const game = await seedGame()

    await openAdminCards(page)
    await page.getByTestId(SELECTORS.ADMIN_CARD_NEW).click()
    await pickOption(
      page,
      SELECTORS.CARD_FORM_TYPE,
      SELECTORS.CARD_FORM_TYPE_OPTION(CARD_TYPE.GAME),
    )
    await pickOption(
      page,
      SELECTORS.CARD_FORM_GAME,
      SELECTORS.CARD_FORM_GAME_OPTION(game.id),
    )
    await fillCardProperties(page, CARD_RARITY.UNCOMMON, CARD_NUMBER)
    await page.getByTestId(SELECTORS.CARD_FORM_SUBMIT).click()

    await expect
      .poll(() => getCardsOfGame(game.id))
      .toMatchObject([
        {
          type: CARD_TYPE.GAME,
          cardProperties: { rarity: CARD_RARITY.UNCOMMON, number: CARD_NUMBER },
        },
      ])
  })

  test("should edit a card's rarity and number", async ({ page }) => {
    const game = await seedGame()
    const { cardId } = await seedMapCard(game.id, {
      rarity: CARD_RARITY.COMMON,
      number: CARD_NUMBER,
    })

    await openAdminCards(page)
    await page.getByTestId(SELECTORS.ADMIN_CARD_ROW(cardId)).click()
    await fillCardProperties(page, CARD_RARITY.ULTRA_RARE, EDITED_CARD_NUMBER)
    await page.getByTestId(SELECTORS.CARD_FORM_SUBMIT).click()

    await expect
      .poll(async () => (await getCard(cardId))?.cardProperties)
      .toEqual({ rarity: CARD_RARITY.ULTRA_RARE, number: EDITED_CARD_NUMBER })
  })

  test("should delete a card", async ({ page }) => {
    const game = await seedGame()
    const { cardId } = await seedMapCard(game.id, {
      rarity: CARD_RARITY.COMMON,
      number: CARD_NUMBER,
    })

    await openAdminCards(page)
    await page.getByTestId(SELECTORS.ADMIN_CARD_ROW(cardId)).click()
    await page.getByTestId(SELECTORS.CARD_DELETE).click()
    await page.getByTestId(SELECTORS.CARD_DELETE_CONFIRM).click()

    await expect(
      page.getByTestId(SELECTORS.ADMIN_CARD_ROW(cardId)),
    ).toBeHidden()
    expect(await getCard(cardId)).toBeUndefined()
  })
})
