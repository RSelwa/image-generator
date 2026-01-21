import { readFileSync } from "node:fs"
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest"
import { generateCoverageReport, setupMedia, setupUserRole } from "./utils"

const projectId = "pusher-292200"
const host = "localhost"
const port = 8080
const rules = readFileSync("./src/firestore.rules", "utf8")

let testEnv: RulesTestEnvironment

describe("Firebase Security Rules", () => {
  beforeAll(async () => {
    const firestore = { port, host, rules }

    testEnv = await initializeTestEnvironment({ projectId, firestore })
  })

  beforeEach(async () => {
    await testEnv.clearFirestore()
  })

  afterAll(async () => {
    const urlCoverageJson = `http://${host}:${port}/emulator/v1/projects/${projectId}:ruleCoverage`

    await generateCoverageReport(urlCoverageJson)
  })

  describe("board saved images collection", () => {
    test("should be able to read own doc", async () => {
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `board_saved_images/${uid}`), {
          uid,
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `board_saved_images/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    test("should be able to create own doc", async () => {
      const uid = "uid"

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await setDoc(doc(authedUserDb, `board_saved_images/${uid}`), { uid })

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `board_saved_images/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    describe("saved image document", () => {
      const uid = "uid"
      const imageId = "imageId"

      const path = `board_saved_images/${uid}/saved_images/${imageId}`

      test("should be able to read own doc", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), path), { uid })
        })

        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        const result = await assertSucceeds(getDoc(doc(authedUserDb, path)))

        expect(result).toBeDefined()
      })

      test("should be able to create own doc", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), path), { uid })
        })

        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await setDoc(doc(authedUserDb, path), { imageId })

        const result = await assertSucceeds(getDoc(doc(authedUserDb, path)))

        expect(result).toBeDefined()
      })

      describe("as an Admin", () => {
        test("should be able to list all docs", async () => {
          await setupUserRole(testEnv, "admin", "Admin")

          const authedUserDb = testEnv.authenticatedContext("admin").firestore()

          const savedImagesDocs = getDocs(
            collection(authedUserDb, "board_saved_images/123/saved_images"),
          )

          const result = await assertSucceeds(savedImagesDocs)
          expect(result).toBeDefined()
        })

        test("should not be able to get an individual doc", async () => {
          await setupUserRole(testEnv, "admin", "Admin")

          const authedUserDb = testEnv.authenticatedContext("admin").firestore()

          const savedImageDoc = getDoc(
            doc(authedUserDb, "board_saved_images/123/saved_images/123"),
          )

          const result = await assertFails(savedImageDoc)
          expect(result.code).toBe("permission-denied")
        })
      })

      describe("as a Communication Manager", () => {
        test("should be able to list all docs", async () => {
          await setupUserRole(testEnv, "com_manager", "Com-Manager")

          const authedUserDb = testEnv
            .authenticatedContext("com_manager")
            .firestore()

          const savedImagesDocs = getDocs(
            collection(authedUserDb, "board_saved_images/123/saved_images"),
          )

          const result = await assertSucceeds(savedImagesDocs)
          expect(result).toBeDefined()
        })

        test("should not be able to get an individual doc", async () => {
          await setupUserRole(testEnv, "com_manager", "Com-Manager")

          const authedUserDb = testEnv
            .authenticatedContext("com_manager")
            .firestore()

          const savedImageDoc = getDoc(
            doc(authedUserDb, "board_saved_images/123/saved_images/123"),
          )

          const result = await assertFails(savedImageDoc)
          expect(result.code).toBe("permission-denied")
        })
      })

      describe("as a Sale", () => {
        test("should be able to list all docs", async () => {
          await setupUserRole(testEnv, "sale", "Sale")

          const authedUserDb = testEnv.authenticatedContext("sale").firestore()

          const savedImagesDocs = getDocs(
            collection(authedUserDb, "board_saved_images/123/saved_images"),
          )

          const result = await assertSucceeds(savedImagesDocs)
          expect(result).toBeDefined()
        })

        test("should be able to get an individual doc", async () => {
          await setupUserRole(testEnv, "sale", "Sale")

          const authedUserDb = testEnv.authenticatedContext("sale").firestore()

          const savedImageDoc = getDoc(
            doc(authedUserDb, "board_saved_images/123/saved_images/123"),
          )

          const result = await assertFails(savedImageDoc)
          expect(result.code).toBe("permission-denied")
        })
      })
    })
  })

  describe("media collection", () => {
    describe("as an iconograph", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const mediasCollection = getDocs(collection(authedUserDb, "medias"))

        const result = await assertSucceeds(mediasCollection)

        expect(result).toBeDefined()
      })

      test("should be able to get an individual doc", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const mediaDoc = getDoc(doc(authedUserDb, "medias/123"))

        const result = await assertSucceeds(mediaDoc)

        expect(result).toBeDefined()
      })

      test("should be able to update the field 'tags' only", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")
        await setupMedia(testEnv, "123")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const updateMediaDoc = updateDoc(doc(authedUserDb, "medias/123"), {
          tags: { lvl0: ["Error"] },
        })

        const result = await assertSucceeds(updateMediaDoc)

        expect(result).toBeUndefined()
      })

      test("should not be able to update others fields", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")
        await setupMedia(testEnv, "123")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const updateMediaDoc = updateDoc(doc(authedUserDb, "medias/123"), {
          original_title: "Mario bros 2",
        })

        const result = await assertFails(updateMediaDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to update the field 'tags' among others fields", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")
        await setupMedia(testEnv, "123")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const updateMediaDoc = updateDoc(doc(authedUserDb, "medias/123"), {
          tags: { lvl0: ["Error"] },
          original_title: "Mario bros 2",
        })

        const result = await assertFails(updateMediaDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to create a doc", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const createMediaDoc = addDoc(collection(authedUserDb, "medias"), {
          tags: { lvl0: ["Error"] },
          original_title: "Mario bros 2",
        })

        const result = await assertFails(createMediaDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to delete a doc", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const deleteMediaDoc = deleteDoc(doc(authedUserDb, "medias/123"))

        const result = await assertFails(deleteMediaDoc)
        expect(result.code).toBe("permission-denied")
      })
    })

    describe("as a fashion", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const mediasCollection = getDocs(collection(authedUserDb, "medias"))

        const result = await assertSucceeds(mediasCollection)

        expect(result).toBeDefined()
      })

      test("should be able to get an individual doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "medias/123"), {
            category: "MOVIES",
          })
        })

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const movieDoc = getDoc(doc(authedUserDb, "medias/123"))

        const result = await assertSucceeds(movieDoc)
        expect(result).toBeDefined()
      })

      test("should be able to only update the fields 'fashion_items' & 'tags'", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "medias/123"), {
            category: "MOVIES",
            fashion_items: [],
            tags: [],
          })
        })

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const updateMovieDoc = updateDoc(doc(authedUserDb, "medias/123"), {
          fashion_items: ["123"],
          tags: ["ERROR"],
        })

        const result = await assertSucceeds(updateMovieDoc)
        expect(result).toBe(undefined)
      })

      test("should not be able to update others fields", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "medias/123"), {
            category: "MOVIES",
            original_title: "Mario bros 1",
          })
        })

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const updateMovieDoc = updateDoc(doc(authedUserDb, "medias/123"), {
          original_title: "Mario bros 2",
        })

        const result = await assertFails(updateMovieDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to create a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const createMediaDoc = addDoc(collection(authedUserDb, "medias"), {
          original_title: "Mario bros 1",
        })

        const result = await assertFails(createMediaDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to delete a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const deleteMediaDoc = deleteDoc(doc(authedUserDb, "medias/123"))

        const result = await assertFails(deleteMediaDoc)
        expect(result.code).toBe("permission-denied")
      })
    })
  })

  describe("usersv2 collection", () => {
    test("should be able to read own doc", async () => {
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `usersv2/${uid}`), { uid })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `usersv2/${uid}`)),
      )

      expect(result).toBeDefined()
    })
  })

  describe("secrets collection", () => {
    describe("bo secrets document", () => {
      test("should not be able to get the doc as an unauthenticated", async () => {
        const db = testEnv.unauthenticatedContext().firestore()
        const secretDoc = db.collection("secrets").doc("bo")

        const result = await assertFails(secretDoc.get())

        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to get the doc as an authenticated", async () => {
        const db = testEnv.authenticatedContext("user").firestore()
        const secretDoc = db.collection("secrets").doc("bo")

        const result = await assertFails(secretDoc.get())

        expect(result.code).toBe("permission-denied")
      })

      test("should be able to get the doc as a Sales", async () => {
        await setupUserRole(testEnv, "sales", "Sale")

        const authedUserDb = testEnv.authenticatedContext("sales").firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as an Admin", async () => {
        await setupUserRole(testEnv, "admin", "Admin")

        const authedUserDb = testEnv.authenticatedContext("admin").firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Curator", async () => {
        await setupUserRole(testEnv, "curator", "Curator")

        const authedUserDb = testEnv.authenticatedContext("curator").firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as an Iconograph", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Communication", async () => {
        await setupUserRole(testEnv, "communication", "Communication")

        const authedUserDb = testEnv
          .authenticatedContext("communication")
          .firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Database Manager", async () => {
        await setupUserRole(testEnv, "db_manager", "Database-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("db_manager")
          .firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Communication Manager", async () => {
        await setupUserRole(testEnv, "com_manager", "Com-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("com_manager")
          .firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as Burande", async () => {
        await setupUserRole(testEnv, "burande", "Burande")

        const authedUserDb = testEnv.authenticatedContext("burande").firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Fashion", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const secretDoc = getDoc(doc(authedUserDb, "secrets/bo"))

        const result = await assertSucceeds(secretDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })
    })
  })

  describe("modals collection", () => {
    test("should be able to get a doc as an unauthenticated", async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      const secretDoc = db.collection("modals").doc("bo")

      const result = await assertSucceeds(secretDoc.get())

      expect(result).toBeDefined()
    })

    test("should be able to write a doc as an admin", async () => {
      await setupUserRole(testEnv, "admin", "Admin")

      const authedUserDb = testEnv.authenticatedContext("admin").firestore()

      const uid = "uid"

      await setDoc(doc(authedUserDb, `modals/${uid}`), { uid })

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `modals/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    test("should be able to write a doc as a Communication Manager", async () => {
      await setupUserRole(testEnv, "com_manager", "Com-Manager")

      const authedUserDb = testEnv
        .authenticatedContext("com_manager")
        .firestore()

      const uid = "uid"

      await setDoc(doc(authedUserDb, `modals/${uid}`), { uid })

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `modals/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    test("should not be able to write a doc as a Communication member", async () => {
      await setupUserRole(testEnv, "communication", "Communication")

      const authedUserDb = testEnv
        .authenticatedContext("communication")
        .firestore()

      const uid = "uid"

      const createModalDoc = addDoc(collection(authedUserDb, "modals"), {
        uid,
      })

      const result = await assertFails(createModalDoc)
      expect(result.code).toBe("permission-denied")
    })

    test("should not be able to write a doc as an Iconograph", async () => {
      await setupUserRole(testEnv, "iconograph", "Iconograph")

      const authedUserDb = testEnv
        .authenticatedContext("iconograph")
        .firestore()

      const uid = "uid"

      const createModalDoc = addDoc(collection(authedUserDb, "modals"), {
        uid,
      })

      const result = await assertFails(createModalDoc)
      expect(result.code).toBe("permission-denied")
    })

    test("should not be able to write a doc as an unauthenticated", async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      const secretDoc = db.collection("modals").add({ id: "test" })

      const result = await assertFails(secretDoc)

      expect(result.code).toBe("permission-denied")
    })

    test("should be able to update a doc as an authenticated if stats field is modified", async () => {
      const docPath = "modals/beautiful_modal"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), docPath), {})
      })

      const unauthenticatedUser = testEnv.unauthenticatedContext().firestore()

      const updateModalStatsDoc = updateDoc(doc(unauthenticatedUser, docPath), {
        stats: {
          displayed: 1,
          clicked: 1,
          dismissed: 1,
        },
      })

      const result = await assertSucceeds(updateModalStatsDoc)

      expect(result).toBeUndefined()
    })

    test("should not be able to update a doc as an authenticated if other fields than stats is modified", async () => {
      const docPath = "modals/beautiful_modal"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), docPath), {})
      })

      const unauthenticatedUser = testEnv.unauthenticatedContext().firestore()

      const updateModalStatsDoc = updateDoc(doc(unauthenticatedUser, docPath), {
        title: "New title",
        stats: {
          displayed: 1,
          clicked: 1,
          dismissed: 1,
        },
      })

      const result = await assertFails(updateModalStatsDoc)

      expect(result.code).toBe("permission-denied")
    })
  })

  describe("banners collection", () => {
    test("should be able to get a doc as an unauthenticated", async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      const bannerDoc = db.collection("banners").doc("bo")

      const result = await assertSucceeds(bannerDoc.get())

      expect(result).toBeDefined()
    })

    test("should be able to write a doc as an admin", async () => {
      await setupUserRole(testEnv, "admin", "Admin")

      const authedUserDb = testEnv.authenticatedContext("admin").firestore()

      const uid = "uid"

      await setDoc(doc(authedUserDb, `banners/${uid}`), { uid })

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `banners/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    test("should not be able to write a doc as an unauthenticated", async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      const bannerDoc = db.collection("banners").add({ id: "test" })

      const result = await assertFails(bannerDoc)

      expect(result.code).toBe("permission-denied")
    })
  })

  describe("offers collection", () => {
    test("should be able to get a doc as an unauthenticated", async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      const offerDoc = db.collection("offers").doc("bo")

      const result = await assertSucceeds(offerDoc.get())

      expect(result).toBeDefined()
    })

    test("should be able to write a doc as an admin", async () => {
      await setupUserRole(testEnv, "admin", "Admin")

      const authedUserDb = testEnv.authenticatedContext("admin").firestore()

      const uid = "uid"

      await setDoc(doc(authedUserDb, `offers/${uid}`), { uid })

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `offers/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    test("should not be able to write a doc as an unauthenticated", async () => {
      const db = testEnv.unauthenticatedContext().firestore()
      const offerDoc = db.collection("offers").add({ id: "test" })

      const result = await assertFails(offerDoc)

      expect(result.code).toBe("permission-denied")
    })
  })

  describe("labels collection", () => {
    describe("bo tags document", () => {
      test("should not be able to get the doc as an unauthenticated", async () => {
        const db = testEnv.unauthenticatedContext().firestore()
        const boTagsDoc = db.collection("labels").doc("bo_tags")

        const result = await assertFails(boTagsDoc.get())

        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to get the doc as an authenticated", async () => {
        const db = testEnv.authenticatedContext("user").firestore()
        const boTagsDoc = db.collection("labels").doc("bo_tags")

        const result = await assertFails(boTagsDoc.get())

        expect(result.code).toBe("permission-denied")
      })

      test("should be able to get the doc as an Admin", async () => {
        await setupUserRole(testEnv, "admin", "Admin")

        const authedUserDb = testEnv.authenticatedContext("admin").firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Sales", async () => {
        await setupUserRole(testEnv, "sales", "Sale")

        const authedUserDb = testEnv.authenticatedContext("sales").firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Curator", async () => {
        await setupUserRole(testEnv, "curator", "Curator")

        const authedUserDb = testEnv.authenticatedContext("curator").firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as an Iconograph", async () => {
        await setupUserRole(testEnv, "iconograph", "Iconograph")

        const authedUserDb = testEnv
          .authenticatedContext("iconograph")
          .firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Database Manager", async () => {
        await setupUserRole(testEnv, "db_manager", "Database-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("db_manager")
          .firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Communication Manager", async () => {
        await setupUserRole(testEnv, "com_manager", "Com-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("com_manager")
          .firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as Burande", async () => {
        await setupUserRole(testEnv, "burande", "Burande")

        const authedUserDb = testEnv.authenticatedContext("burande").firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })

      test("should be able to get the doc as a Fashion", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const boTagsDoc = getDoc(doc(authedUserDb, "labels/bo_tags"))

        const result = await assertSucceeds(boTagsDoc)

        expect(result).toBeDefined()
        expect(result.data()).toBeUndefined()
      })
    })
    describe("fashion categories document", () => {
      test("should not be able to get the doc as an unauthenticated", async () => {
        const db = testEnv.unauthenticatedContext().firestore()
        const fashionCategoriesDoc = db
          .collection("labels")
          .doc("fashion_categories")

        const result = await assertFails(fashionCategoriesDoc.get())

        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to get the doc as an authenticated", async () => {
        const db = testEnv.authenticatedContext("user").firestore()
        const fashionCategoriesDoc = db
          .collection("labels")
          .doc("fashion_categories")

        const result = await assertFails(fashionCategoriesDoc.get())

        expect(result.code).toBe("permission-denied")
      })

      describe("as an Admin", () => {
        test("should be able to get the doc", async () => {
          await setupUserRole(testEnv, "admin", "Admin")

          const authedUserDb = testEnv.authenticatedContext("admin").firestore()

          const fashionCategoriesDoc = getDoc(
            doc(authedUserDb, "labels/fashion_categories"),
          )

          const result = await assertSucceeds(fashionCategoriesDoc)

          expect(result).toBeDefined()
          expect(result.data()).toBeUndefined()
        })

        test("should be able to update the doc", async () => {
          await setupUserRole(testEnv, "admin", "Admin")

          await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(
              doc(context.firestore(), "labels/fashion_categories"),
              {},
            )
          })

          const authedUserDb = testEnv.authenticatedContext("admin").firestore()

          const updateFashionCategoriesDoc = updateDoc(
            doc(authedUserDb, "labels/fashion_categories"),
            { hats: [] },
          )

          const result = await assertSucceeds(updateFashionCategoriesDoc)
          expect(result).toBeUndefined()
        })
      })

      describe("as a Database Manager", () => {
        test("should be able to get the doc", async () => {
          await setupUserRole(testEnv, "db_manager", "Database-Manager")

          const authedUserDb = testEnv
            .authenticatedContext("db_manager")
            .firestore()

          const fashionCategoriesDoc = getDoc(
            doc(authedUserDb, "labels/fashion_categories"),
          )

          const result = await assertSucceeds(fashionCategoriesDoc)

          expect(result).toBeDefined()
          expect(result.data()).toBeUndefined()
        })

        test("should be able to update the doc", async () => {
          await setupUserRole(testEnv, "db_manager", "Database-Manager")

          await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(
              doc(context.firestore(), "labels/fashion_categories"),
              {},
            )
          })

          const authedUserDb = testEnv
            .authenticatedContext("db_manager")
            .firestore()

          const updateFashionCategoriesDoc = updateDoc(
            doc(authedUserDb, "labels/fashion_categories"),
            { hats: [] },
          )

          const result = await assertSucceeds(updateFashionCategoriesDoc)
          expect(result).toBeUndefined()
        })
      })

      describe("as Burande", () => {
        test("should be able to get the doc", async () => {
          await setupUserRole(testEnv, "burande", "Burande")

          const authedUserDb = testEnv
            .authenticatedContext("burande")
            .firestore()

          const fashionCategoriesDoc = getDoc(
            doc(authedUserDb, "labels/fashion_categories"),
          )

          const result = await assertSucceeds(fashionCategoriesDoc)

          expect(result).toBeDefined()
          expect(result.data()).toBeUndefined()
        })

        test("should be able to update the doc", async () => {
          await setupUserRole(testEnv, "burande", "Burande")

          await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(
              doc(context.firestore(), "labels/fashion_categories"),
              {},
            )
          })

          const authedUserDb = testEnv
            .authenticatedContext("burande")
            .firestore()

          const updateFashionCategoriesDoc = updateDoc(
            doc(authedUserDb, "labels/fashion_categories"),
            { hats: [] },
          )

          const result = await assertSucceeds(updateFashionCategoriesDoc)
          expect(result).toBeUndefined()
        })
      })

      describe("as a Fashion", () => {
        test("should be able to get the doc", async () => {
          await setupUserRole(testEnv, "fashion", "Fashion")

          const authedUserDb = testEnv
            .authenticatedContext("fashion")
            .firestore()

          const fashionCategoriesDoc = getDoc(
            doc(authedUserDb, "labels/fashion_categories"),
          )

          const result = await assertSucceeds(fashionCategoriesDoc)

          expect(result).toBeDefined()
          expect(result.data()).toBeUndefined()
        })

        test("should be able to update the doc", async () => {
          await setupUserRole(testEnv, "fashion", "Fashion")

          await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(
              doc(context.firestore(), "labels/fashion_categories"),
              {},
            )
          })

          const authedUserDb = testEnv
            .authenticatedContext("fashion")
            .firestore()

          const updateFashionCategoriesDoc = updateDoc(
            doc(authedUserDb, "labels/fashion_categories"),
            { hats: [] },
          )

          const result = await assertSucceeds(updateFashionCategoriesDoc)
          expect(result).toBeUndefined()
        })
      })
    })
  })

  describe("humans collection", () => {
    describe("as an Database Manager", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "db_manager", "Database-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("db_manager")
          .firestore()

        const humansCollection = getDocs(collection(authedUserDb, "humans"))

        const result = await assertSucceeds(humansCollection)
        expect(result).toBeDefined()
      })

      test("should be able to get an individual doc", async () => {
        await setupUserRole(testEnv, "db_manager", "Database-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("db_manager")
          .firestore()

        const humanDoc = getDoc(doc(authedUserDb, "humans/123"))

        const result = await assertSucceeds(humanDoc)
        expect(result).toBeDefined()
      })

      test("should be able to create a doc", async () => {
        await setupUserRole(testEnv, "db_manager", "Database-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("db_manager")
          .firestore()

        const humanDoc = addDoc(collection(authedUserDb, "humans"), {})

        const result = await assertSucceeds(humanDoc)
        expect(result).toBeDefined()
      })

      test("should be able to update a doc", async () => {
        await setupUserRole(testEnv, "db_manager", "Database-Manager")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "humans/123"), {})
        })

        const authedUserDb = testEnv
          .authenticatedContext("db_manager")
          .firestore()

        const updateHumanDoc = updateDoc(doc(authedUserDb, "humans/123"), {
          name: "Mario",
        })

        const result = await assertSucceeds(updateHumanDoc)
        expect(result).toBeUndefined()
      })

      test("should not be able to delete a doc", async () => {
        await setupUserRole(testEnv, "db_manager", "Database-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("db_manager")
          .firestore()

        const deleteHumanDoc = deleteDoc(doc(authedUserDb, "humans/123"))

        const result = await assertFails(deleteHumanDoc)
        expect(result.code).toBe("permission-denied")
      })
    })
    describe("as Burande", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "burande", "Burande")

        const authedUserDb = testEnv.authenticatedContext("burande").firestore()

        const humansCollection = getDocs(collection(authedUserDb, "humans"))

        const result = await assertSucceeds(humansCollection)
        expect(result).toBeDefined()
      })

      test("should be able to get an individual doc", async () => {
        await setupUserRole(testEnv, "burande", "Burande")

        const authedUserDb = testEnv.authenticatedContext("burande").firestore()

        const humanDoc = getDoc(doc(authedUserDb, "humans/123"))

        const result = await assertSucceeds(humanDoc)
        expect(result).toBeDefined()
      })

      test("should be able to create a doc", async () => {
        await setupUserRole(testEnv, "burande", "Burande")

        const authedUserDb = testEnv.authenticatedContext("burande").firestore()

        const humanDoc = addDoc(collection(authedUserDb, "humans"), {})

        const result = await assertSucceeds(humanDoc)
        expect(result).toBeDefined()
      })

      test("should be able to update a doc", async () => {
        await setupUserRole(testEnv, "burande", "Burande")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "humans/123"), {})
        })

        const authedUserDb = testEnv.authenticatedContext("burande").firestore()

        const updateHumanDoc = updateDoc(doc(authedUserDb, "humans/123"), {
          name: "Mario",
        })

        const result = await assertSucceeds(updateHumanDoc)
        expect(result).toBeUndefined()
      })

      test("should not be able to delete a doc", async () => {
        await setupUserRole(testEnv, "burande", "Burande")

        const authedUserDb = testEnv.authenticatedContext("burande").firestore()

        const deleteHumanDoc = deleteDoc(doc(authedUserDb, "humans/123"))

        const result = await assertFails(deleteHumanDoc)
        expect(result.code).toBe("permission-denied")
      })
    })
    describe("as a Fashion", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const humansCollection = getDocs(collection(authedUserDb, "humans"))

        const result = await assertSucceeds(humansCollection)
        expect(result).toBeDefined()
      })

      test("should be able to get an individual doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const humanDoc = getDoc(doc(authedUserDb, "humans/123"))

        const result = await assertSucceeds(humanDoc)
        expect(result).toBeDefined()
      })

      test("should be able to create a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const humanDoc = addDoc(collection(authedUserDb, "humans"), {})

        const result = await assertSucceeds(humanDoc)
        expect(result).toBeDefined()
      })

      test("should not be able to update a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "humans/123"), {})
        })

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const updateHumanDoc = updateDoc(doc(authedUserDb, "humans/123"), {
          name: "Mario",
        })

        const result = await assertFails(updateHumanDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to delete a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const deleteHumanDoc = deleteDoc(doc(authedUserDb, "humans/123"))

        const result = await assertFails(deleteHumanDoc)
        expect(result.code).toBe("permission-denied")
      })
    })
  })

  describe("fashion items collection", () => {
    describe("as a Fashion", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const fashionItemsCollection = getDocs(
          collection(authedUserDb, "fashion_items"),
        )

        const result = await assertSucceeds(fashionItemsCollection)
        expect(result).toBeDefined()
      })

      test("should be able to get an individual doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const fashionItemDoc = getDoc(doc(authedUserDb, "fashion_items/123"))

        const result = await assertSucceeds(fashionItemDoc)
        expect(result).toBeDefined()
      })

      test("should be able to create a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const fashionItemDoc = addDoc(
          collection(authedUserDb, "fashion_items"),
          {},
        )

        const result = await assertSucceeds(fashionItemDoc)
        expect(result).toBeDefined()
      })

      test("should be able to update a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "fashion_items/123"), {
            type: "dress",
          })
        })

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const updateFashionItemDoc = updateDoc(
          doc(authedUserDb, "fashion_items/123"),
          { type: "shoes" },
        )

        const result = await assertSucceeds(updateFashionItemDoc)
        expect(result).toBeUndefined()
      })

      test("should be able to delete a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const deleteFashionItemDoc = deleteDoc(
          doc(authedUserDb, "fashion_items/123"),
        )

        const result = await assertSucceeds(deleteFashionItemDoc)
        expect(result).toBeUndefined()
      })
    })
  })

  describe("images collection", () => {
    describe("as a Fashion", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const imagesCollection = getDocs(collection(authedUserDb, "images"))

        const result = await assertSucceeds(imagesCollection)
        expect(result).toBeDefined()
      })

      test("should be able to get an individual doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const imageDoc = getDoc(doc(authedUserDb, "images/123"))

        const result = await assertSucceeds(imageDoc)
        expect(result).toBeDefined()
      })

      test("should not be able to create a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const imageDoc = addDoc(collection(authedUserDb, "images"), {})

        const result = await assertFails(imageDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to update a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "images/123"), {
            original_filename: "mario_bros",
          })
        })

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const updateImageDoc = updateDoc(doc(authedUserDb, "images/123"), {
          original_filename: "mario_bros_2",
        })

        const result = await assertFails(updateImageDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to delete a doc", async () => {
        await setupUserRole(testEnv, "fashion", "Fashion")

        const authedUserDb = testEnv.authenticatedContext("fashion").firestore()

        const deleteImageDoc = deleteDoc(doc(authedUserDb, "images/123"))

        const result = await assertFails(deleteImageDoc)
        expect(result.code).toBe("permission-denied")
      })
    })
    describe("fashion selections collection", () => {
      describe("as a Fashion", () => {
        test("should be able to list all docs", async () => {
          await setupUserRole(testEnv, "fashion", "Fashion")

          const authedUserDb = testEnv
            .authenticatedContext("fashion")
            .firestore()

          const fashionSelectionsSubCollection = getDocs(
            collection(authedUserDb, "images/123/fashion_selections"),
          )

          const result = await assertSucceeds(fashionSelectionsSubCollection)
          expect(result).toBeDefined()
        })

        test("should be able to get an individual doc", async () => {
          await setupUserRole(testEnv, "fashion", "Fashion")

          const authedUserDb = testEnv
            .authenticatedContext("fashion")
            .firestore()

          const fashionSelectionDoc = getDoc(
            doc(authedUserDb, "images/123/fashion_selections/123"),
          )

          const result = await assertSucceeds(fashionSelectionDoc)
          expect(result).toBeDefined()
        })

        test("should be able to create a doc", async () => {
          await setupUserRole(testEnv, "fashion", "Fashion")

          const authedUserDb = testEnv
            .authenticatedContext("fashion")
            .firestore()

          const createFashionSelectionDoc = addDoc(
            collection(authedUserDb, "images/123/fashion_selections"),
            {},
          )

          const result = await assertSucceeds(createFashionSelectionDoc)
          expect(result).toBeDefined()
        })

        test("should be able to update a doc", async () => {
          await setupUserRole(testEnv, "fashion", "Fashion")

          await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(
              doc(context.firestore(), "images/123/fashion_selections/123"),
              { points: [1, 1, 1] },
            )
          })

          const authedUserDb = testEnv
            .authenticatedContext("fashion")
            .firestore()

          const updateFashionSelectionDoc = updateDoc(
            doc(authedUserDb, "images/123/fashion_selections/123"),
            { points: [0, 0, 0] },
          )

          const result = await assertSucceeds(updateFashionSelectionDoc)
          expect(result).toBeUndefined()
        })

        test("should be able to delete a doc", async () => {
          await setupUserRole(testEnv, "fashion", "Fashion")

          const authedUserDb = testEnv
            .authenticatedContext("fashion")
            .firestore()

          const deleteFashionSelectionDoc = deleteDoc(
            doc(authedUserDb, "images/123/fashion_selections/123"),
          )

          const result = await assertSucceeds(deleteFashionSelectionDoc)
          expect(result).toBeUndefined()
        })
      })
    })
  })

  describe("user genai collection", () => {
    describe("as an unauthenticated", () => {
      test("should not be able to list all docs", async () => {
        const db = testEnv.unauthenticatedContext().firestore()

        const generationDocs = getDocs(db.collection("user_genai"))

        const result = await assertFails(generationDocs)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to get an individual doc", async () => {
        const db = testEnv.unauthenticatedContext().firestore()

        const generationDoc = getDoc(db.doc("user_genai/123"))

        const result = await assertFails(generationDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to create a doc", async () => {
        const db = testEnv.unauthenticatedContext().firestore()

        const generationDoc = db.collection("user_genai").add({})

        const result = await assertFails(generationDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to update a doc", async () => {
        const db = testEnv.unauthenticatedContext().firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            status: "WAITING",
          })
        })

        const updateGenerationDoc = db
          .doc("user_genai/123")
          .update({ status: "DONE" })

        const result = await assertFails(updateGenerationDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to delete a doc", async () => {
        const db = testEnv.unauthenticatedContext().firestore()

        const deleteGenerationDoc = db.doc("user_genai/123").delete()

        const result = await assertFails(deleteGenerationDoc)
        expect(result.code).toBe("permission-denied")
      })
    })
    describe("as an authenticated", () => {
      const uid = "uid"

      test("should be able to list all own docs", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: uid,
          })
        })

        const generationDocs = getDocs(
          query(
            collection(authedUserDb, "user_genai"),
            where("ownerId", "==", uid),
          ),
        )

        const result = await assertSucceeds(generationDocs)
        expect(result).toBeDefined()
      })

      test("should be able to get a single own doc", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: uid,
          })
        })

        const generationDoc = getDoc(doc(authedUserDb, "user_genai/123"))

        const result = await assertSucceeds(generationDoc)
        expect(result).toBeDefined()
      })

      test("should be able to create own doc", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        const generationDoc = addDoc(collection(authedUserDb, "user_genai"), {
          ownerId: uid,
        })

        const result = await assertSucceeds(generationDoc)
        expect(result).toBeDefined()
      })

      test("should be able to update own doc", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: uid,
            status: "WAITING",
          })
        })

        const updateGenerationDoc = updateDoc(
          doc(authedUserDb, "user_genai/123"),
          { status: "DONE" },
        )

        const result = await assertSucceeds(updateGenerationDoc)
        expect(result).toBeUndefined()
      })

      test("should not be able to list all docs", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {})
        })

        const generationDocs = getDocs(collection(authedUserDb, "user_genai"))

        const result = await assertFails(generationDocs)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to get a doc", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {})
        })

        const generationDoc = getDoc(doc(authedUserDb, "user_genai/123"))

        const result = await assertFails(generationDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to update the creditCosts field", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: uid,
            creditCosts: 5,
          })
        })

        const updateGenerationDoc = updateDoc(
          doc(authedUserDb, "user_genai/123"),
          { creditCosts: 1 },
        )

        const result = await assertFails(updateGenerationDoc)
        expect(result.code).toBe("permission-denied")
      })

      test("should not be able to delete a doc", async () => {
        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        const deleteGenerationDoc = deleteDoc(
          doc(authedUserDb, "user_genai/123"),
        )

        const result = await assertFails(deleteGenerationDoc)
        expect(result.code).toBe("permission-denied")
      })
    })
    describe("as an Admin", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "admin", "Admin")

        const authedUserDb = testEnv.authenticatedContext("admin").firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: "user",
          })
        })

        const generationDocs = getDocs(collection(authedUserDb, "user_genai"))

        const result = await assertSucceeds(generationDocs)
        expect(result).toBeDefined()
      })

      test("should be able to get a doc", async () => {
        await setupUserRole(testEnv, "admin", "Admin")

        const authedUserDb = testEnv.authenticatedContext("admin").firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: "user",
          })
        })

        const generationDoc = getDoc(doc(authedUserDb, "user_genai/123"))

        const result = await assertSucceeds(generationDoc)
        expect(result).toBeDefined()
      })
    })
    describe("as a Communication", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "communication", "Communication")

        const authedUserDb = testEnv
          .authenticatedContext("communication")
          .firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: "user",
          })
        })

        const generationDocs = getDocs(collection(authedUserDb, "user_genai"))

        const result = await assertSucceeds(generationDocs)
        expect(result).toBeDefined()
      })

      test("should be able to get a doc", async () => {
        await setupUserRole(testEnv, "communication", "Communication")

        const authedUserDb = testEnv
          .authenticatedContext("communication")
          .firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: "user",
          })
        })

        const generationDoc = getDoc(doc(authedUserDb, "user_genai/123"))

        const result = await assertSucceeds(generationDoc)
        expect(result).toBeDefined()
      })
    })
    describe("as a Communication Manager", () => {
      test("should be able to list all docs", async () => {
        await setupUserRole(testEnv, "com_manager", "Com-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("com_manager")
          .firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: "user",
          })
        })

        const generationDocs = getDocs(collection(authedUserDb, "user_genai"))

        const result = await assertSucceeds(generationDocs)
        expect(result).toBeDefined()
      })

      test("should be able to get a doc", async () => {
        await setupUserRole(testEnv, "com_manager", "Com-Manager")

        const authedUserDb = testEnv
          .authenticatedContext("com_manager")
          .firestore()

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "user_genai/123"), {
            ownerId: "user",
          })
        })

        const generationDoc = getDoc(doc(authedUserDb, "user_genai/123"))

        const result = await assertSucceeds(generationDoc)
        expect(result).toBeDefined()
      })
    })
  })
})
