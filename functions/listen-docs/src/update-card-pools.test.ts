import { CARD_RARITY, TABLES } from "@repo/common"
import { type CardProperties, type CardPoolDoc } from "@repo/schemas"
import { makeDocumentSnapshot } from "@repo/testing/document-snapshot"
import { getFirestore } from "firebase-admin/firestore"
import firebaseFunctionsTest from "firebase-functions-test"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { listen_doc_maps_written } from "~/index"

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      "FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.",
    )
  }
})

const test = firebaseFunctionsTest()

const GAME_ID = "game-1"
const MAP_ID = "map-1"
const ENTRY = { mapId: MAP_ID, gameId: GAME_ID }
const OTHER_ENTRY = { mapId: "map-2", gameId: GAME_ID }
const MAP_PATH = `${TABLES.GAMES}/${GAME_ID}/${TABLES.MAPS}/${MAP_ID}`

const getPoolRef = (rarity: string) =>
  getFirestore().doc(`${TABLES.CARD_POOLS}/${rarity}`)

const getPoolMaps = async (rarity: string) => {
  const doc = await getPoolRef(rarity).get()

  return (doc.data() as CardPoolDoc | undefined)?.maps
}

const makeMap = (cardProperties?: CardProperties) => ({
  name: "Kanto",
  gameId: GAME_ID,
  ...(cardProperties && { cardProperties }),
})

const writeMap = async (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) => {
  await test.wrap(listen_doc_maps_written)({
    data: {
      before: makeDocumentSnapshot(before, MAP_PATH),
      after: makeDocumentSnapshot(after, MAP_PATH),
    },
    params: { gameId: GAME_ID, mapId: MAP_ID },
  })
}

beforeEach(async () => {
  await Promise.all(
    Object.values(CARD_RARITY).map((rarity) => getPoolRef(rarity).delete()),
  )
})

describe("when a map gets card properties", () => {
  it("should add it to the pool of its rarity", async () => {
    await getPoolRef(CARD_RARITY.RARE).set({ maps: [OTHER_ENTRY] })

    await writeMap(makeMap(), makeMap({ rarity: CARD_RARITY.RARE }))

    expect(await getPoolMaps(CARD_RARITY.RARE)).toEqual([OTHER_ENTRY, ENTRY])
  })
})

describe("when a map is created as a card", () => {
  it("should create the pool of its rarity", async () => {
    await writeMap({}, makeMap({ rarity: CARD_RARITY.LEGENDARY }))

    expect(await getPoolMaps(CARD_RARITY.LEGENDARY)).toEqual([ENTRY])
  })
})

describe("when a card's rarity changes", () => {
  it("should move it from the old pool to the new one", async () => {
    await getPoolRef(CARD_RARITY.COMMON).set({ maps: [ENTRY, OTHER_ENTRY] })

    await writeMap(
      makeMap({ rarity: CARD_RARITY.COMMON }),
      makeMap({ rarity: CARD_RARITY.ULTRA_RARE }),
    )

    expect(await getPoolMaps(CARD_RARITY.COMMON)).toEqual([OTHER_ENTRY])
    expect(await getPoolMaps(CARD_RARITY.ULTRA_RARE)).toEqual([ENTRY])
  })
})

describe("when a map loses its card properties", () => {
  it("should remove it from its pool", async () => {
    await getPoolRef(CARD_RARITY.UNCOMMON).set({ maps: [ENTRY, OTHER_ENTRY] })

    await writeMap(makeMap({ rarity: CARD_RARITY.UNCOMMON }), makeMap())

    expect(await getPoolMaps(CARD_RARITY.UNCOMMON)).toEqual([OTHER_ENTRY])
  })
})

describe("when a card map is deleted", () => {
  it("should remove it from its pool", async () => {
    await getPoolRef(CARD_RARITY.RARE).set({ maps: [ENTRY] })

    await writeMap(makeMap({ rarity: CARD_RARITY.RARE }), {})

    expect(await getPoolMaps(CARD_RARITY.RARE)).toEqual([])
  })
})

describe("when a card map changes without changing its rarity", () => {
  it("should leave the pools untouched", async () => {
    await writeMap(makeMap({ rarity: CARD_RARITY.RARE }), {
      ...makeMap({ rarity: CARD_RARITY.RARE }),
      name: "Johto",
    })

    expect(await getPoolMaps(CARD_RARITY.RARE)).toBeUndefined()
  })
})
