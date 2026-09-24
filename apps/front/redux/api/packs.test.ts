import { configureStore } from "@reduxjs/toolkit"
import { CARD_RARITY } from "@repo/common"
import { afterEach, describe, expect, it, vi } from "vitest"
import { API_ENDPOINTS } from "@/constants/mapping"
import { packsApi } from "@/redux/api/packs"

const TOKEN = "id-token"

const { currentUser } = vi.hoisted(() => ({
  currentUser: { value: null as { getIdToken: () => Promise<string> } | null },
}))

vi.mock("@/constants/db-refs", () => ({ TABLES_SUB_REFS: {} }))

vi.mock("@/constants/db", () => ({
  auth: {
    get currentUser() {
      return currentUser.value
    },
  },
}))

const OPEN_PACK_RESPONSE = {
  cards: [
    {
      mapId: "kanto",
      gameId: "pokemon-red",
      name: "Kanto",
      imageUrl: null,
      cardProperties: { rarity: CARD_RARITY.RARE },
      isNew: true,
    },
  ],
  packsStored: 6,
  packsRefillAnchorMs: 1_000_000,
}

const buildStore = () =>
  configureStore({
    reducer: { [packsApi.reducerPath]: packsApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(packsApi.middleware),
  })

const openPack = () =>
  buildStore().dispatch(packsApi.endpoints.openPack.initiate())

const mockFetch = (response: Response) => {
  const fetchMock = vi.fn(async () => response)
  vi.stubGlobal("fetch", fetchMock)

  return fetchMock
}

afterEach(() => {
  currentUser.value = null
  vi.unstubAllGlobals()
})

describe("when a signed-in user opens a pack", () => {
  it("should send the id token to the endpoint", async () => {
    currentUser.value = { getIdToken: async () => TOKEN }
    const fetchMock = mockFetch(Response.json(OPEN_PACK_RESPONSE))

    await openPack()

    expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.OPEN_PACK, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
  })

  it("should return the revealed cards", async () => {
    currentUser.value = { getIdToken: async () => TOKEN }
    mockFetch(Response.json(OPEN_PACK_RESPONSE))

    expect((await openPack()).data).toEqual(OPEN_PACK_RESPONSE)
  })
})

describe("when the endpoint refuses the pack", () => {
  it("should return an error", async () => {
    currentUser.value = { getIdToken: async () => TOKEN }
    mockFetch(new Response("No pack available", { status: 409 }))

    expect((await openPack()).error).toBeDefined()
  })
})

describe("when no user is signed in", () => {
  it("should not call the endpoint", async () => {
    const fetchMock = mockFetch(Response.json(OPEN_PACK_RESPONSE))

    const { error } = await openPack()

    expect(error).toBeDefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
