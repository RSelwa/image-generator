import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage"
import { readFileSync } from "node:fs"
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest"

const PROJECT_ID = "tiktok-generator-fa261"
const HOST = "localhost"
const STORAGE_PORT = 9199 // Default Firebase Storage emulator port
const storageRules = readFileSync("./src/storage.rules", "utf8")

let testEnv: RulesTestEnvironment

describe("Firebase Storage Rules", () => {
  beforeAll(async () => {
    const storage = { port: STORAGE_PORT, host: HOST, rules: storageRules }

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      storage,
    })
  })

  beforeEach(async () => {
    await testEnv.clearStorage()
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  const testFile = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]) // "Hello" in bytes

  describe("game-thumbnails", () => {
    test("should allow unauthenticated read", async () => {
      // First upload a file with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage()
        await uploadBytes(ref(storage, "game-thumbnails/test.png"), testFile)
      })

      const unauthedStorage = testEnv.unauthenticatedContext().storage()

      await assertSucceeds(
        getDownloadURL(ref(unauthedStorage, "game-thumbnails/test.png")),
      )
    })

    test("should allow authenticated create", async () => {
      const uid = "user1"
      const authedStorage = testEnv.authenticatedContext(uid).storage()

      await assertSucceeds(
        uploadBytes(ref(authedStorage, "game-thumbnails/test.png"), testFile),
      )
    })

    test("should deny unauthenticated create", async () => {
      const unauthedStorage = testEnv.unauthenticatedContext().storage()

      await assertFails(
        uploadBytes(ref(unauthedStorage, "game-thumbnails/test.png"), testFile),
      )
    })

    test("should deny delete even when authenticated", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage()
        await uploadBytes(ref(storage, "game-thumbnails/test.png"), testFile)
      })

      const authedStorage = testEnv.authenticatedContext(uid).storage()

      await assertFails(
        deleteObject(ref(authedStorage, "game-thumbnails/test.png")),
      )
    })
  })

  describe("sphericals", () => {
    test("should allow unauthenticated read", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage()
        await uploadBytes(ref(storage, "sphericals/test.jpg"), testFile)
      })

      const unauthedStorage = testEnv.unauthenticatedContext().storage()

      await assertSucceeds(
        getDownloadURL(ref(unauthedStorage, "sphericals/test.jpg")),
      )
    })

    test("should allow authenticated create", async () => {
      const uid = "user1"
      const authedStorage = testEnv.authenticatedContext(uid).storage()

      await assertSucceeds(
        uploadBytes(ref(authedStorage, "sphericals/test.jpg"), testFile),
      )
    })

    test("should deny unauthenticated create", async () => {
      const unauthedStorage = testEnv.unauthenticatedContext().storage()

      await assertFails(
        uploadBytes(ref(unauthedStorage, "sphericals/test.jpg"), testFile),
      )
    })
  })

  describe("map-thumbnails", () => {
    test("should allow unauthenticated read", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage()
        await uploadBytes(ref(storage, "map-thumbnails/test.png"), testFile)
      })

      const unauthedStorage = testEnv.unauthenticatedContext().storage()

      await assertSucceeds(
        getDownloadURL(ref(unauthedStorage, "map-thumbnails/test.png")),
      )
    })

    test("should allow authenticated create", async () => {
      const uid = "user1"
      const authedStorage = testEnv.authenticatedContext(uid).storage()

      await assertSucceeds(
        uploadBytes(ref(authedStorage, "map-thumbnails/test.png"), testFile),
      )
    })

    test("should deny unauthenticated create", async () => {
      const unauthedStorage = testEnv.unauthenticatedContext().storage()

      await assertFails(
        uploadBytes(ref(unauthedStorage, "map-thumbnails/test.png"), testFile),
      )
    })

    test("should deny delete even when authenticated", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage()
        await uploadBytes(ref(storage, "map-thumbnails/test.png"), testFile)
      })

      const authedStorage = testEnv.authenticatedContext(uid).storage()

      await assertFails(
        deleteObject(ref(authedStorage, "map-thumbnails/test.png")),
      )
    })
  })

  describe("other paths", () => {
    test("should deny read on unlisted paths", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage()
        await uploadBytes(ref(storage, "other/test.png"), testFile)
      })

      const unauthedStorage = testEnv.unauthenticatedContext().storage()

      await assertFails(getDownloadURL(ref(unauthedStorage, "other/test.png")))
    })

    test("should deny write on unlisted paths even when authenticated", async () => {
      const uid = "user1"
      const authedStorage = testEnv.authenticatedContext(uid).storage()

      await assertFails(
        uploadBytes(ref(authedStorage, "other/test.png"), testFile),
      )
    })
  })
})
