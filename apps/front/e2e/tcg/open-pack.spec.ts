import { faker } from "@faker-js/faker"
import { type APIRequestContext, expect, test } from "@playwright/test"
import { CARD_RARITY, PACK_SIZE, PACKS_MAX, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { signUpAuthUser } from "@repo/testing/emulator"
import { gameFactory, mapFactory } from "@repo/testing/factory"
import { Timestamp } from "firebase-admin/firestore"
import { PASSWORD } from "../helpers/lobby"

const ENDPOINT = "/api/packs/open"
const CARD_PROPERTIES = { rarity: CARD_RARITY.LEGENDARY }

const signUp = () =>
  signUpAuthUser({
    email: faker.internet.email({ provider: "yopmail.com" }).toLowerCase(),
    password: PASSWORD,
  })

const openPack = (request: APIRequestContext, idToken?: string) =>
  request.post(ENDPOINT, {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  })

const seedEveryPoolWithOneMap = async () => {
  const game = gameFactory()
  const map = mapFactory({ gameId: game.id, cardProperties: CARD_PROPERTIES })
  await refs[TABLES.GAMES].doc(game.id).set(game)
  await subRefs[TABLES.MAPS](game.id).doc(map.id).set(map)
  await Promise.all(
    Object.values(CARD_RARITY).map((rarity) =>
      refs[TABLES.CARD_POOLS]
        .doc(rarity)
        .set({ maps: [{ mapId: map.id, gameId: game.id }] }),
    ),
  )

  return map
}

const getUser = async (uid: string) =>
  (await refs[TABLES.USERS].doc(uid).get()).data()

const getCard = async (uid: string, mapId: string) =>
  (await subRefs[TABLES.CARDS](uid).doc(mapId).get()).data()

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
    const map = await seedEveryPoolWithOneMap()
    const { uid, idToken } = await signUp()

    const response = await openPack(request, idToken)

    expect(response.status()).toBe(200)
    const { cards, packsStored } = await response.json()
    expect(cards).toHaveLength(PACK_SIZE)
    expect(cards[0]).toMatchObject({
      mapId: map.id,
      name: map.name,
      cardProperties: CARD_PROPERTIES,
      isNew: true,
    })
    expect(packsStored).toBe(PACKS_MAX - 1)
    expect((await getUser(uid))?.packsStored).toBe(PACKS_MAX - 1)
    expect(await getCard(uid, map.id)).toMatchObject({
      count: PACK_SIZE,
      cardPropertiesAtPull: CARD_PROPERTIES,
    })
  })

  test("should add a duplicate to the owned count", async ({ request }) => {
    const map = await seedEveryPoolWithOneMap()
    const { uid, idToken } = await signUp()

    await openPack(request, idToken)
    const response = await openPack(request, idToken)

    expect(response.status()).toBe(200)
    const { cards } = await response.json()
    expect(cards[0].isNew).toBe(false)
    expect((await getCard(uid, map.id))?.count).toBe(2 * PACK_SIZE)
  })
})
