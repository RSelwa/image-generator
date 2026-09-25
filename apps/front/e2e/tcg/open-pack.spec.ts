import { faker } from "@faker-js/faker"
import { type APIRequestContext, expect, test } from "@playwright/test"
import { CARD_RARITY, PACK_SIZE, PACKS_MAX, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { signUpAuthUser } from "@repo/testing/emulator"
import { Timestamp } from "firebase-admin/firestore"
import { PASSWORD } from "../helpers/lobby"
import { seedEveryPoolWithOneCard } from "../helpers/tcg"

const CARD_NUMBER = 42

const ENDPOINT = "/api/packs/open"
const CARD_PROPERTIES = { rarity: CARD_RARITY.LEGENDARY, number: CARD_NUMBER }

const signUp = () =>
  signUpAuthUser({
    email: faker.internet.email({ provider: "yopmail.com" }).toLowerCase(),
    password: PASSWORD,
  })

const openPack = (request: APIRequestContext, idToken?: string) =>
  request.post(ENDPOINT, {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  })

const getUser = async (uid: string) =>
  (await refs[TABLES.USERS].doc(uid).get()).data()

const getOwnedCard = async (uid: string, cardId: string) =>
  (await subRefs[TABLES.CARDS](uid).doc(cardId).get()).data()

test.describe.configure({ mode: "serial" })

test.describe("when a pack is opened", () => {
  test("should reject a request without a token", async ({ request }) => {
    const response = await openPack(request)

    expect(response.status()).toBe(401)
  })

  test("should reject a user without any pack left", async ({ request }) => {
    const { uid, idToken } = await signUp()
    await refs[TABLES.USERS]
      .doc(uid)
      .update({ packsStored: 0, packsRefillAnchor: Timestamp.now() })

    const response = await openPack(request, idToken)

    expect(response.status()).toBe(409)
    expect((await getUser(uid))?.packsStored).toBe(0)
  })

  test("should reveal the drawn cards and consume one pack", async ({
    request,
  }) => {
    const { map, cardId } = await seedEveryPoolWithOneCard(CARD_PROPERTIES)
    const { uid, idToken } = await signUp()

    const response = await openPack(request, idToken)

    expect(response.status()).toBe(200)
    const { cards, packsStored } = await response.json()
    expect(cards).toHaveLength(PACK_SIZE)
    expect(cards[0]).toMatchObject({
      cardId,
      mapId: map.id,
      name: map.name,
      cardProperties: CARD_PROPERTIES,
      isNew: true,
    })
    expect(packsStored).toBe(PACKS_MAX - 1)
    expect((await getUser(uid))?.packsStored).toBe(PACKS_MAX - 1)
    expect(await getOwnedCard(uid, cardId)).toMatchObject({
      count: PACK_SIZE,
      cardPropertiesAtPull: CARD_PROPERTIES,
    })
  })

  test("should add a duplicate to the owned count", async ({ request }) => {
    const { cardId } = await seedEveryPoolWithOneCard(CARD_PROPERTIES)
    const { uid, idToken } = await signUp()

    await openPack(request, idToken)
    const response = await openPack(request, idToken)

    expect(response.status()).toBe(200)
    const { cards } = await response.json()
    expect(cards[0].isNew).toBe(false)
    expect((await getOwnedCard(uid, cardId))?.count).toBe(2 * PACK_SIZE)
  })
})
