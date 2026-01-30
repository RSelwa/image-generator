import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { readFileSync } from "node:fs"
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest"
import { generateCoverageReport } from "./utils"

const projectId = "tiktok-generator-fa261"
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

  describe("users collection", () => {
    test("should be able to read own doc", async () => {
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `users/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    test("should be able to write doc as admin", async () => {
      const adminUid = "admin"
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${adminUid}`), {
          uid: adminUid,
          rights: "admin",
        })
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
        })
      })

      const authedUserDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        updateDoc(doc(authedUserDb, `users/${uid}`), {
          updatedAt: true,
          rights: "admin",
        }),
      )
    })

    test("should be able to write own doc", async () => {
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(authedUserDb, `users/${uid}`), {
          updatedAt: true,
        }),
      )
    })

    test("should not be able to write own doc if contains 'rights' fields", async () => {
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, `users/${uid}`), {
          updatedAt: true,
          rights: "admin",
        }),
      )
    })

    test("should not be able to write other doc if not admin", async () => {
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: "admin",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `users/${uid}`)),
      )

      expect(result).toBeDefined()
    })
  })

  describe("games collection", () => {
    test("should be able to read a doc even if not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "games/game1"), {
          name: "Test Game",
        })
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      const result = await assertSucceeds(
        getDoc(doc(unauthedDb, "games/game1")),
      )

      expect(result).toBeDefined()
    })

    test("should not be able to create a doc while not admin", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: [],
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(authedUserDb, "games/game1"), { name: "Test Game" }),
      )
    })

    test("should not be able to update a doc while not admin", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: [],
        })
        await setDoc(doc(context.firestore(), "games/game1"), {
          name: "Test Game",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, "games/game1"), { name: "Updated Game" }),
      )
    })

    test("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, "games/game1"), { name: "Test Game" }),
      )
    })

    test("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: "admin",
        })
        await setDoc(doc(context.firestore(), "games/game1"), {
          name: "Test Game",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, "games/game1"), { name: "Updated Game" }),
      )
    })
  })

  describe("maps subcollection (games/{gameId}/maps)", () => {
    const gameId = "game1"
    const mapPath = `games/${gameId}/maps/map1`

    test("should be able to read a doc even if not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), mapPath), {
          name: "Test Map",
        })
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      const result = await assertSucceeds(getDoc(doc(unauthedDb, mapPath)))

      expect(result).toBeDefined()
    })

    test("should not be able to create a doc while not admin", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: [],
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(authedUserDb, mapPath), { name: "Test Map" }),
      )
    })

    test("should not be able to update a doc while not admin", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: [],
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), mapPath), {
          name: "Test Map",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, mapPath), { name: "Updated Map" }),
      )
    })

    test("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: "admin",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, mapPath), { name: "Test Map" }),
      )
    })

    test("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: "admin",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), mapPath), {
          name: "Test Map",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, mapPath), { name: "Updated Map" }),
      )
    })
  })

  describe("spherical collection", () => {
    test("should be able to read a doc even if not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "spherical/spherical1"), {
          name: "Test Spherical",
        })
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      const result = await assertSucceeds(
        getDoc(doc(unauthedDb, "spherical/spherical1")),
      )

      expect(result).toBeDefined()
    })

    test("should not be able to create a doc while not admin", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: [],
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(authedUserDb, "spherical/spherical1"), {
          name: "Test Spherical",
        }),
      )
    })

    test("should not be able to update a doc while not admin", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: [],
        })
        await setDoc(doc(context.firestore(), "spherical/spherical1"), {
          name: "Test Spherical",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, "spherical/spherical1"), {
          name: "Updated Spherical",
        }),
      )
    })

    test("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, "spherical/spherical1"), {
          name: "Test Spherical",
        }),
      )
    })

    test("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: "admin",
        })
        await setDoc(doc(context.firestore(), "spherical/spherical1"), {
          name: "Test Spherical",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, "spherical/spherical1"), {
          name: "Updated Spherical",
        }),
      )
    })
  })
})
