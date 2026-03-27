import { DIFFICULTIES, DOCUMENTS_STATUS, METADATA_DOCS, mockedImageURL, mockedSphericalImageURL, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type ReadyImagesDoc } from "@repo/schemas"
import { flatFactory, gameFactory, sphericalFactory } from "@repo/testing/factory"
import firebaseFunctionsTest from "firebase-functions-test"
import { makeDocumentSnapshot } from "firebase-functions-test/lib/providers/firestore"
import { beforeAll, describe, expect, it } from "vitest"
import { listen_doc_flat_written, listen_doc_games_written, listen_doc_spherical_written } from "~/index"

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.")
  }
})

const test = firebaseFunctionsTest()

const getSphericalPath = (gameId: string, sphericalId: string) =>
  `${TABLES.GAMES}/${gameId}/${TABLES.SPHERICAL}/${sphericalId}`

describe("listen sphericals docs changes for status", () => {
  it("should not update status if new document has not mapId, mapPosition nor thumbnail", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({
    })
    const spherical = sphericalFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.WAITING,
      difficulty: DIFFICULTIES.EASY,

    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, difficulty: DIFFICULTIES.MEDIUM }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const sphericalSnapshot = await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).get()
    expect(sphericalSnapshot.data()?.status).toBe("waiting")
  })

  it("should not update status to needVerification if document is already ready and has mapId and mapPosition", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.READY,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, mapId: "map123", mapPosition: { x: 10, y: 20 } }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const sphericalSnapshot = await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).get()
    expect(sphericalSnapshot.data()?.status).toBe("ready")
  })

  it("should not update status to needVerification if document is already ready and has thumbnail", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.READY,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, thumbnail: mockedImageURL }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const sphericalSnapshot = await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).get()
    expect(sphericalSnapshot.data()?.status).toBe("ready")
  })

  it("should update status to needVerification if document has mapId and mapPosition", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.WAITING,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, mapId: "map123", mapPosition: { x: 10, y: 20 } }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const sphericalSnapshot = await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).get()
    expect(sphericalSnapshot.data()?.status).toBe("need_verification")
  })

  it("should update status to needVerification if document has thumbnail", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.WAITING,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, thumbnail: mockedImageURL }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const sphericalSnapshot = await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).get()
    expect(sphericalSnapshot.data()?.status).toBe("need_verification")
  })
})

const getFlatPath = (gameId: string, flatId: string) =>
  `${TABLES.GAMES}/${gameId}/${TABLES.FLAT}/${flatId}`

describe("listen flats docs changes for status", () => {
  it("should not update status if new document has not thumbnail", async () => {
    const cloudFnWrap = test.wrap(listen_doc_flat_written)

    const game = gameFactory({})
    const flat = flatFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.WAITING,
      difficulty: DIFFICULTIES.EASY,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.FLAT](game.id).doc(flat.id).set(flat)

    const before = makeDocumentSnapshot(flat, getFlatPath(game.id, flat.id))
    const after = makeDocumentSnapshot({ ...flat, difficulty: DIFFICULTIES.MEDIUM }, getFlatPath(game.id, flat.id))

    await cloudFnWrap({
      data: { before, after },
      params: { flatId: flat.id, gameId: game.id },
    })

    const flatSnapshot = await subRefs[TABLES.FLAT](game.id).doc(flat.id).get()
    expect(flatSnapshot.data()?.status).toBe("waiting")
  })

  it("should not update status to needVerification if document is already ready and has thumbnail", async () => {
    const cloudFnWrap = test.wrap(listen_doc_flat_written)

    const game = gameFactory({})
    const flat = flatFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.READY,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.FLAT](game.id).doc(flat.id).set(flat)

    const before = makeDocumentSnapshot(flat, getFlatPath(game.id, flat.id))
    const after = makeDocumentSnapshot({ ...flat, thumbnail: mockedImageURL }, getFlatPath(game.id, flat.id))

    await cloudFnWrap({
      data: { before, after },
      params: { flatId: flat.id, gameId: game.id },
    })

    const flatSnapshot = await subRefs[TABLES.FLAT](game.id).doc(flat.id).get()
    expect(flatSnapshot.data()?.status).toBe("ready")
  })

  it("should update status to needVerification if document has thumbnail", async () => {
    const cloudFnWrap = test.wrap(listen_doc_flat_written)

    const game = gameFactory({})
    const flat = flatFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.WAITING,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.FLAT](game.id).doc(flat.id).set(flat)

    const before = makeDocumentSnapshot(flat, getFlatPath(game.id, flat.id))
    const after = makeDocumentSnapshot({ ...flat, thumbnail: mockedImageURL }, getFlatPath(game.id, flat.id))

    await cloudFnWrap({
      data: { before, after },
      params: { flatId: flat.id, gameId: game.id },
    })

    const flatSnapshot = await subRefs[TABLES.FLAT](game.id).doc(flat.id).get()
    expect(flatSnapshot.data()?.status).toBe("need_verification")
  })

  it("should not update status to needVerification if document is already need_verification and has thumbnail", async () => {
    const cloudFnWrap = test.wrap(listen_doc_flat_written)

    const game = gameFactory({})
    const flat = flatFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.NEED_VERIFICATION,
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.FLAT](game.id).doc(flat.id).set(flat)

    const before = makeDocumentSnapshot(flat, getFlatPath(game.id, flat.id))
    const after = makeDocumentSnapshot({ ...flat, thumbnail: mockedImageURL }, getFlatPath(game.id, flat.id))

    await cloudFnWrap({
      data: { before, after },
      params: { flatId: flat.id, gameId: game.id },
    })

    const flatSnapshot = await subRefs[TABLES.FLAT](game.id).doc(flat.id).get()
    expect(flatSnapshot.data()?.status).toBe("need_verification")
  })

  it("should not update status if document has thumbnail but no image", async () => {
    const cloudFnWrap = test.wrap(listen_doc_flat_written)

    const game = gameFactory({})
    const flat = flatFactory({
      gameId: game.id,
      status: DOCUMENTS_STATUS.WAITING,
      image: "",
    })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.FLAT](game.id).doc(flat.id).set(flat)

    const before = makeDocumentSnapshot(flat, getFlatPath(game.id, flat.id))
    const after = makeDocumentSnapshot({ ...flat, thumbnail: mockedImageURL }, getFlatPath(game.id, flat.id))

    await cloudFnWrap({
      data: { before, after },
      params: { flatId: flat.id, gameId: game.id },
    })

    const flatSnapshot = await subRefs[TABLES.FLAT](game.id).doc(flat.id).get()
    expect(flatSnapshot.data()?.status).toBe("waiting")
  })
})

const getGamePath = (gameId: string) => `${TABLES.GAMES}/${gameId}`

const getGamesListData = async () => {
  const doc = await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).get()

  return doc.data()
}

describe("listen games docs changes for gamesList metadata", () => {
  it("should add a game to gamesList when a game is created", async () => {
    const cloudFnWrap = test.wrap(listen_doc_games_written)

    const game = gameFactory({})

    await refs[TABLES.GAMES].doc(game.id).set(game)

    const before = makeDocumentSnapshot({}, getGamePath(game.id))
    const after = makeDocumentSnapshot(game, getGamePath(game.id))

    await cloudFnWrap({
      data: { before, after },
      params: { gameId: game.id },
    })

    const data = await getGamesListData()

    expect(data?.games).toEqual(
      expect.arrayContaining([{ id: game.id, title: game.title }]),
    )
  })

  it("should create the metadata doc if it does not exist on first game creation", async () => {
    const cloudFnWrap = test.wrap(listen_doc_games_written)

    // Clean up metadata doc to simulate fresh state
    await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).delete()

    const game = gameFactory({})

    await refs[TABLES.GAMES].doc(game.id).set(game)

    const before = makeDocumentSnapshot({}, getGamePath(game.id))
    const after = makeDocumentSnapshot(game, getGamePath(game.id))

    await cloudFnWrap({
      data: { before, after },
      params: { gameId: game.id },
    })

    const data = await getGamesListData()

    expect(data?.games).toEqual([{ id: game.id, title: game.title }])
  })

  it("should remove a game from gamesList when a game is deleted", async () => {
    const cloudFnWrap = test.wrap(listen_doc_games_written)

    const game = gameFactory({})

    // Seed the metadata doc with the game
    await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).set({
      games: [{ id: game.id, title: game.title }],
    })

    const before = makeDocumentSnapshot(game, getGamePath(game.id))
    const after = makeDocumentSnapshot({}, getGamePath(game.id))

    await cloudFnWrap({
      data: { before, after },
      params: { gameId: game.id },
    })

    const data = await getGamesListData()

    expect(data?.games).toEqual([])
  })

  it("should update the title in gamesList when a game title changes", async () => {
    const cloudFnWrap = test.wrap(listen_doc_games_written)

    const game = gameFactory({})
    const updatedGame = { ...game, title: "new title" }

    // Seed the metadata doc with the game
    await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).set({
      games: [{ id: game.id, title: game.title }],
    })

    const before = makeDocumentSnapshot(game, getGamePath(game.id))
    const after = makeDocumentSnapshot(updatedGame, getGamePath(game.id))

    await cloudFnWrap({
      data: { before, after },
      params: { gameId: game.id },
    })

    const data = await getGamesListData()

    expect(data?.games).toEqual([{ id: game.id, title: "new title" }])
  })

  it("should not update gamesList when a game is updated without title change", async () => {
    const cloudFnWrap = test.wrap(listen_doc_games_written)

    const game = gameFactory({})
    const updatedGame = { ...game, description: "updated description" }

    // Seed the metadata doc with the game
    await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).set({
      games: [{ id: game.id, title: game.title }],
    })

    const before = makeDocumentSnapshot(game, getGamePath(game.id))
    const after = makeDocumentSnapshot(updatedGame, getGamePath(game.id))

    await cloudFnWrap({
      data: { before, after },
      params: { gameId: game.id },
    })

    const data = await getGamesListData()

    expect(data?.games).toEqual([{ id: game.id, title: game.title }])
  })

  it("should only remove the deleted game and keep others", async () => {
    const cloudFnWrap = test.wrap(listen_doc_games_written)

    const game1 = gameFactory({})
    const game2 = gameFactory({})

    // Seed the metadata doc with both games
    await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).set({
      games: [
        { id: game1.id, title: game1.title },
        { id: game2.id, title: game2.title },
      ],
    })

    const before = makeDocumentSnapshot(game1, getGamePath(game1.id))
    const after = makeDocumentSnapshot({}, getGamePath(game1.id))

    await cloudFnWrap({
      data: { before, after },
      params: { gameId: game1.id },
    })

    const data = await getGamesListData()

    expect(data?.games).toEqual([{ id: game2.id, title: game2.title }])
  })
})

const getReadyImagesData = async (): Promise<ReadyImagesDoc> => {
  const doc = await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).get()
  const data = doc.data() as ReadyImagesDoc | undefined

  return data || { sphericals: [], flats: [] }
}

describe("listen sphericals docs changes for readyImages metadata", () => {
  it("should add a spherical to readyImages when status becomes ready", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL, status: DOCUMENTS_STATUS.WAITING })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, status: DOCUMENTS_STATUS.READY }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const data = await getReadyImagesData()

    expect(data.sphericals).toEqual([{ id: spherical.id, gameId: game.id, image: mockedSphericalImageURL }])
  })

  it("should remove a spherical from readyImages when status changes from ready to another status", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)
    await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).set({
      sphericals: [{ id: spherical.id, gameId: game.id, image: mockedSphericalImageURL }],
      flats: [],
    })

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, status: DOCUMENTS_STATUS.WAITING }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const data = await getReadyImagesData()

    expect(data.sphericals).toEqual([])
  })

  it("should update the image in readyImages when a ready spherical image changes", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)
    await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).set({
      sphericals: [{ id: spherical.id, gameId: game.id, image: mockedSphericalImageURL }],
      flats: [],
    })

    const newImage = "https://example.com/new-image.jpg"
    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, image: newImage }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const data = await getReadyImagesData()

    expect(data.sphericals).toEqual([{ id: spherical.id, gameId: game.id, image: newImage }])
  })

  it("should not modify readyImages when a non-ready spherical is updated without status change", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL, status: DOCUMENTS_STATUS.WAITING })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical.id).set(spherical)
    await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).set({ sphericals: [], flats: [] })

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({ ...spherical, difficulty: DIFFICULTIES.MEDIUM }, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const data = await getReadyImagesData()

    expect(data.sphericals).toEqual([])
  })

  it("should keep other sphericals when removing one from readyImages", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical1 = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL, status: DOCUMENTS_STATUS.READY })
    const spherical2 = sphericalFactory({ gameId: game.id, image: "https://example.com/2.jpg", status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical1.id).set(spherical1)
    await subRefs[TABLES.SPHERICAL](game.id).doc(spherical2.id).set(spherical2)
    await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).set({
      sphericals: [
        { id: spherical1.id, gameId: game.id, image: mockedSphericalImageURL },
        { id: spherical2.id, gameId: game.id, image: "https://example.com/2.jpg" },
      ],
      flats: [],
    })

    const before = makeDocumentSnapshot(spherical1, getSphericalPath(game.id, spherical1.id))
    const after = makeDocumentSnapshot({ ...spherical1, status: DOCUMENTS_STATUS.WAITING }, getSphericalPath(game.id, spherical1.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical1.id, gameId: game.id },
    })

    const data = await getReadyImagesData()

    expect(data.sphericals).toEqual([{ id: spherical2.id, gameId: game.id, image: "https://example.com/2.jpg" }])
  })

  it("should remove a spherical from readyImages when it is deleted", async () => {
    const cloudFnWrap = test.wrap(listen_doc_spherical_written)

    const game = gameFactory({})
    const spherical = sphericalFactory({ gameId: game.id, image: mockedSphericalImageURL, status: DOCUMENTS_STATUS.READY })

    await refs[TABLES.GAMES].doc(game.id).set(game)
    await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).set({
      sphericals: [{ id: spherical.id, gameId: game.id, image: mockedSphericalImageURL }],
      flats: [],
    })

    const before = makeDocumentSnapshot(spherical, getSphericalPath(game.id, spherical.id))
    const after = makeDocumentSnapshot({}, getSphericalPath(game.id, spherical.id))

    await cloudFnWrap({
      data: { before, after },
      params: { sphericalId: spherical.id, gameId: game.id },
    })

    const data = await getReadyImagesData()

    expect(data.sphericals).toEqual([])
  })
})
