import { configureStore } from "@reduxjs/toolkit"
import { CARD_RARITY, CARD_TYPE, TABLES } from "@repo/common"
import { type CardDocWithId, type CardFields } from "@repo/schemas"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cardApi } from "@/redux/api/cards"

const CARD_NUMBER = 42

const NOW = "now"

const GAME_ID = "pokemon-red"

const MAP_ID = "kanto"

const RARE_FIELDS = { rarity: CARD_RARITY.RARE, number: CARD_NUMBER }

const LEGENDARY_FIELDS = {
  rarity: CARD_RARITY.LEGENDARY,
  number: CARD_NUMBER,
}

const CARD = {
  id: "kanto-card",
  type: CARD_TYPE.MAP,
  gameId: GAME_ID,
  mapId: MAP_ID,
  ...RARE_FIELDS,
  createdAt: null,
  updatedAt: null,
} satisfies CardDocWithId

const { CARDS_REF, firestore } = vi.hoisted(() => ({
  CARDS_REF: "cards-ref",
  firestore: {
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    updateDoc: vi.fn(),
    getDocs: vi.fn(),
  },
}))

vi.mock("firebase/firestore", () => ({
  ...firestore,
  Timestamp: { now: () => NOW },
}))

vi.mock("@/constants/db-refs", async () => {
  const { TABLES } = await import("@repo/common")

  return {
    TABLE_REFS: { [TABLES.CARDS]: CARDS_REF },
    getCardRef: (cardId: string) => `${TABLES.CARDS}/${cardId}`,
  }
})

const buildStore = () =>
  configureStore({
    reducer: { [cardApi.reducerPath]: cardApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(cardApi.middleware),
  })

const saveMapCard = (
  card: CardDocWithId | undefined,
  cardFields: CardFields | undefined,
) =>
  buildStore().dispatch(
    cardApi.endpoints.saveCard.initiate({
      card,
      gameId: GAME_ID,
      mapId: MAP_ID,
      cardFields,
    }),
  )

afterEach(() => {
  vi.clearAllMocks()
})

const expectNoWrite = () => {
  expect(firestore.addDoc).not.toHaveBeenCalled()
  expect(firestore.updateDoc).not.toHaveBeenCalled()
  expect(firestore.deleteDoc).not.toHaveBeenCalled()
}

describe("when a map without a card becomes one", () => {
  it("should create the card", async () => {
    await saveMapCard(undefined, RARE_FIELDS)

    expect(firestore.addDoc).toHaveBeenCalledWith(CARDS_REF, {
      type: CARD_TYPE.MAP,
      gameId: GAME_ID,
      mapId: MAP_ID,
      ...RARE_FIELDS,
      createdAt: NOW,
      updatedAt: NOW,
    })
  })
})

describe("when a game without a card becomes one", () => {
  it("should create a game card", async () => {
    await buildStore().dispatch(
      cardApi.endpoints.saveCard.initiate({
        card: undefined,
        gameId: GAME_ID,
        cardFields: RARE_FIELDS,
      }),
    )

    expect(firestore.addDoc).toHaveBeenCalledWith(CARDS_REF, {
      type: CARD_TYPE.GAME,
      gameId: GAME_ID,
      ...RARE_FIELDS,
      createdAt: NOW,
      updatedAt: NOW,
    })
  })
})

describe("when the card fields change", () => {
  it("should update the card", async () => {
    await saveMapCard(CARD, LEGENDARY_FIELDS)

    expect(firestore.updateDoc).toHaveBeenCalledWith(
      `${TABLES.CARDS}/${CARD.id}`,
      {
        ...LEGENDARY_FIELDS,
        updatedAt: NOW,
      },
    )
  })
})

describe("when the map stops being a card", () => {
  it("should delete the card", async () => {
    await saveMapCard(CARD, undefined)

    expect(firestore.deleteDoc).toHaveBeenCalledWith(
      `${TABLES.CARDS}/${CARD.id}`,
    )
  })
})

describe("when the card properties are unchanged", () => {
  it("should not write", async () => {
    await saveMapCard(CARD, { ...RARE_FIELDS })

    expectNoWrite()
  })
})

describe("when a map without a card stays one", () => {
  it("should not write", async () => {
    await saveMapCard(undefined, undefined)

    expectNoWrite()
  })
})

describe("when the write fails", () => {
  it("should return an error", async () => {
    firestore.addDoc.mockRejectedValueOnce(new Error("PERMISSION_DENIED"))

    expect((await saveMapCard(undefined, RARE_FIELDS)).error).toBeDefined()
  })
})

describe("when a card doc is malformed", () => {
  it("should skip it", async () => {
    const { id, ...cardData } = CARD
    firestore.getDocs.mockResolvedValueOnce({
      docs: [
        { id, data: () => cardData },
        { id: "broken", data: () => ({ type: CARD_TYPE.MAP }) },
      ],
    })

    const { data } = await buildStore().dispatch(
      cardApi.endpoints.getCards.initiate(),
    )

    expect(data).toEqual([CARD])
  })
})
