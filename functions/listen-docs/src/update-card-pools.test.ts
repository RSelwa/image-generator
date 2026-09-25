import { CARD_RARITY, CARD_TYPE, TABLES } from "@repo/common"
import { type CardProperties, type CardPoolDoc } from "@repo/schemas"
import { makeDocumentSnapshot } from "@repo/testing/document-snapshot"
import { getFirestore } from "firebase-admin/firestore"
import firebaseFunctionsTest from "firebase-functions-test"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { listen_doc_cards_written } from "~/index"

const CARD_NUMBER = 42

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      "FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.",
    )
  }
})

const test = firebaseFunctionsTest()

const GAME_ID = "game-1"
const OTHER_GAME_ID = "game-2"
const CARD_ID = "card-1"
const ENTRY = { cardId: CARD_ID, gameId: GAME_ID }
const OTHER_ENTRY = { cardId: "card-2", gameId: GAME_ID }
const CARD_PATH = `${TABLES.CARDS}/${CARD_ID}`

const getPoolRef = (rarity: string) =>
  getFirestore().doc(`${TABLES.CARD_POOLS}/${rarity}`)

const getPoolCards = async (rarity: string) => {
  const doc = await getPoolRef(rarity).get()

  return (doc.data() as CardPoolDoc | undefined)?.cards
}

const makeCard = (cardProperties: CardProperties, gameId = GAME_ID) => ({
  type: CARD_TYPE.MAP,
  gameId,
  mapId: "map-1",
  cardProperties,
})

const writeCard = async (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) => {
  await test.wrap(listen_doc_cards_written)({
    data: {
      before: makeDocumentSnapshot(before, CARD_PATH),
      after: makeDocumentSnapshot(after, CARD_PATH),
    },
    params: { cardId: CARD_ID },
  })
}

beforeEach(async () => {
  await Promise.all(
    Object.values(CARD_RARITY).map((rarity) => getPoolRef(rarity).delete()),
  )
})

describe("when a card is created", () => {
  it("should add it to the pool of its rarity", async () => {
    await getPoolRef(CARD_RARITY.RARE).set({ cards: [OTHER_ENTRY] })

    await writeCard(
      {},
      makeCard({ rarity: CARD_RARITY.RARE, number: CARD_NUMBER }),
    )

    expect(await getPoolCards(CARD_RARITY.RARE)).toEqual([OTHER_ENTRY, ENTRY])
  })

  it("should create the pool of its rarity", async () => {
    await writeCard(
      {},
      makeCard({ rarity: CARD_RARITY.LEGENDARY, number: CARD_NUMBER }),
    )

    expect(await getPoolCards(CARD_RARITY.LEGENDARY)).toEqual([ENTRY])
  })
})

describe("when a card's rarity changes", () => {
  it("should move it from the old pool to the new one", async () => {
    await getPoolRef(CARD_RARITY.COMMON).set({ cards: [ENTRY, OTHER_ENTRY] })

    await writeCard(
      makeCard({ rarity: CARD_RARITY.COMMON, number: CARD_NUMBER }),
      makeCard({ rarity: CARD_RARITY.ULTRA_RARE, number: CARD_NUMBER }),
    )

    expect(await getPoolCards(CARD_RARITY.COMMON)).toEqual([OTHER_ENTRY])
    expect(await getPoolCards(CARD_RARITY.ULTRA_RARE)).toEqual([ENTRY])
  })
})

describe("when a card is deleted", () => {
  it("should remove it from its pool", async () => {
    await getPoolRef(CARD_RARITY.UNCOMMON).set({ cards: [ENTRY, OTHER_ENTRY] })

    await writeCard(
      makeCard({ rarity: CARD_RARITY.UNCOMMON, number: CARD_NUMBER }),
      {},
    )

    expect(await getPoolCards(CARD_RARITY.UNCOMMON)).toEqual([OTHER_ENTRY])
  })
})

describe("when a card changes without changing its rarity", () => {
  it("should leave the pools untouched", async () => {
    await writeCard(
      makeCard({ rarity: CARD_RARITY.RARE, number: CARD_NUMBER }),
      makeCard({ rarity: CARD_RARITY.RARE, number: CARD_NUMBER + 1 }),
    )

    expect(await getPoolCards(CARD_RARITY.RARE)).toBeUndefined()
  })
})

describe("when a card moves to another game without changing its rarity", () => {
  it("should replace its pool entry", async () => {
    await getPoolRef(CARD_RARITY.RARE).set({ cards: [ENTRY, OTHER_ENTRY] })

    await writeCard(
      makeCard({ rarity: CARD_RARITY.RARE, number: CARD_NUMBER }),
      makeCard(
        { rarity: CARD_RARITY.RARE, number: CARD_NUMBER },
        OTHER_GAME_ID,
      ),
    )

    expect(await getPoolCards(CARD_RARITY.RARE)).toEqual([
      OTHER_ENTRY,
      { cardId: CARD_ID, gameId: OTHER_GAME_ID },
    ])
  })
})

describe("when a malformed card is written", () => {
  it("should leave the pools untouched", async () => {
    await writeCard({}, { type: CARD_TYPE.MAP, gameId: GAME_ID })

    expect(await getPoolCards(CARD_RARITY.RARE)).toBeUndefined()
  })
})

describe("when a card becomes malformed", () => {
  it("should remove it from its pool", async () => {
    await getPoolRef(CARD_RARITY.RARE).set({ cards: [ENTRY, OTHER_ENTRY] })

    await writeCard(
      makeCard({ rarity: CARD_RARITY.RARE, number: CARD_NUMBER }),
      { type: CARD_TYPE.MAP, gameId: GAME_ID },
    )

    expect(await getPoolCards(CARD_RARITY.RARE)).toEqual([OTHER_ENTRY])
  })
})
