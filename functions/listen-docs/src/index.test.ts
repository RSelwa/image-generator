import { DIFFICULTIES, DOCUMENTS_STATUS, mockedImageURL, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { gameFactory, sphericalFactory } from "@repo/testing/factory"
import firebaseFunctionsTest from "firebase-functions-test"
import { makeDocumentSnapshot } from "firebase-functions-test/lib/providers/firestore"
import { beforeAll, describe, expect, it } from "vitest"
import { listen_doc_spherical_written } from "~/index"

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
