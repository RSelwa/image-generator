import { readFileSync } from "node:fs"
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import {
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const projectId = "tiktok-generator-fa261"
const host = "localhost"
const port = 8080
const rules = readFileSync("./src/firestore.rules", "utf8")

let testEnv: RulesTestEnvironment

describe("firebase Security Rules", () => {
  beforeAll(async () => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      throw new Error("FIRESTORE_EMULATOR_HOST is not set. Aborting tests to prevent production database modifications.")
    }
    const firestore = { port, host, rules }

    testEnv = await initializeTestEnvironment({ projectId, firestore })
  })

  beforeEach(async () => {
    await testEnv.clearFirestore()
  })

  // afterAll(async () => {
  //   const urlCoverageJson = `http://${host}:${port}/emulator/v1/projects/${projectId}:ruleCoverage`
  //   await generateCoverageReport(urlCoverageJson)
  // })

  describe("rights collection", () => {
    it("should be able to read own rights doc", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `rights/${uid}`)),
      )

      expect(result).toBeDefined()
    })

    it("should not be able to read another user's rights doc", async () => {
      const uid = "user1"
      const otherUid = "user2"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${otherUid}`), {
          uid: otherUid,
          right: "iconograph",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(getDoc(doc(authedUserDb, `rights/${otherUid}`)))
    })

    it("should not be able to read rights doc when not logged in", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(getDoc(doc(unauthedDb, `rights/${uid}`)))
    })

    it("should be able to create rights doc as admin", async () => {
      const adminUid = "admin1"
      const targetUid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        }),
      )
    })

    it("should be able to update rights doc as admin", async () => {
      const adminUid = "admin1"
      const targetUid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, `rights/${targetUid}`), {
          right: "admin",
        }),
      )
    })

    it("should be able to delete rights doc as admin", async () => {
      const adminUid = "admin1"
      const targetUid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, `rights/${targetUid}`)))
    })

    it("should not be able to create rights doc as iconograph", async () => {
      const iconoUid = "icono1"
      const targetUid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${iconoUid}`), {
          uid: iconoUid,
          right: "iconograph",
        })
      })

      const iconoDb = testEnv.authenticatedContext(iconoUid).firestore()

      await assertFails(
        setDoc(doc(iconoDb, `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        }),
      )
    })

    it("should not be able to update rights doc as iconograph", async () => {
      const iconoUid = "icono1"
      const targetUid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${iconoUid}`), {
          uid: iconoUid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        })
      })

      const iconoDb = testEnv.authenticatedContext(iconoUid).firestore()

      await assertFails(
        updateDoc(doc(iconoDb, `rights/${targetUid}`), {
          right: "admin",
        }),
      )
    })

    it("should not be able to delete rights doc as iconograph", async () => {
      const iconoUid = "icono1"
      const targetUid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${iconoUid}`), {
          uid: iconoUid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        })
      })

      const iconoDb = testEnv.authenticatedContext(iconoUid).firestore()

      await assertFails(deleteDoc(doc(iconoDb, `rights/${targetUid}`)))
    })

    it("should not be able to write rights doc as regular user", async () => {
      const uid = "user1"
      const targetUid = "user2"

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(authedUserDb, `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        }),
      )
    })

    it("should not be able to write rights doc when not logged in", async () => {
      const targetUid = "user1"

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        setDoc(doc(unauthedDb, `rights/${targetUid}`), {
          uid: targetUid,
          right: "iconograph",
        }),
      )
    })
  })

  describe("users collection", () => {
    it("should be able to read own doc", async () => {
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

    it("should be able to write doc as admin", async () => {
      const adminUid = "admin"
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${adminUid}`), {
          uid: adminUid,
        })
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
        })
      })

      const authedUserDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        updateDoc(doc(authedUserDb, `users/${uid}`), {
          updatedAt: true,
        }),
      )
    })

    it("should be able to write own doc", async () => {
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

    it("should not be able to write other user doc if not admin", async () => {
      const uid = "uid"
      const otherUid = "otherUid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
        })
        await setDoc(doc(context.firestore(), `users/${otherUid}`), {
          uid: otherUid,
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, `users/${otherUid}`), {
          updatedAt: true,
        }),
      )
    })
  })

  describe("games collection", () => {
    it("should be able to read a doc even if not logged in", async () => {
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

    it("should not be able to create a doc while not admin", async () => {
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

    it("should not be able to update a doc while not admin", async () => {
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

    it("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, "games/game1"), { name: "Test Game" }),
      )
    })

    it("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
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

    it("should be able to delete as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "games/game1"), {
          name: "Test Game",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, "games/game1")))
    })

    it("should be able to create as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(iconoDb, "games/game1"), { name: "Test Game" }),
      )
    })

    it("should be able to update as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), "games/game1"), {
          name: "Test Game",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(iconoDb, "games/game1"), { name: "Updated Game" }),
      )
    })

    it("should not be able to delete as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), "games/game1"), {
          name: "Test Game",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(deleteDoc(doc(iconoDb, "games/game1")))
    })
  })

  describe("flat subcollection (games/{gameId}/flat)", () => {
    const gameId = "game1"
    const flatPath = `games/${gameId}/flat/flat1`

    it("should be able to read a doc even if not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), flatPath), {
          name: "Test Flat",
        })
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      const result = await assertSucceeds(getDoc(doc(unauthedDb, flatPath)))

      expect(result).toBeDefined()
    })

    it("should not be able to create a doc while not admin", async () => {
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
        setDoc(doc(authedUserDb, flatPath), { name: "Test Flat" }),
      )
    })

    it("should not be able to update a doc while not admin", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: [],
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), flatPath), {
          name: "Test Flat",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, flatPath), { name: "Updated Flat" }),
      )
    })

    it("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(setDoc(doc(adminDb, flatPath), { name: "Test Flat" }))
    })

    it("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), flatPath), {
          name: "Test Flat",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, flatPath), { name: "Updated Flat" }),
      )
    })

    it("should be able to delete as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), flatPath), {
          name: "Test Flat",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, flatPath)))
    })

    it("should be able to create as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(setDoc(doc(iconoDb, flatPath), { name: "Test Flat" }))
    })

    it("should be able to update as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), flatPath), {
          name: "Test Flat",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(iconoDb, flatPath), { name: "Updated Flat" }),
      )
    })

    it("should not be able to delete as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), flatPath), {
          name: "Test Flat",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(deleteDoc(doc(iconoDb, flatPath)))
    })
  })

  describe("maps subcollection (games/{gameId}/maps)", () => {
    const gameId = "game1"
    const mapPath = `games/${gameId}/maps/map1`

    it("should be able to read a doc even if not logged in", async () => {
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

    it("should not be able to create a doc while not admin", async () => {
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

    it("should not be able to update a doc while not admin", async () => {
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

    it("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(setDoc(doc(adminDb, mapPath), { name: "Test Map" }))
    })

    it("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
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

    it("should be able to delete as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), mapPath), {
          name: "Test Map",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, mapPath)))
    })

    it("should be able to create as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(setDoc(doc(iconoDb, mapPath), { name: "Test Map" }))
    })

    it("should be able to update as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), mapPath), {
          name: "Test Map",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(iconoDb, mapPath), { name: "Updated Map" }),
      )
    })

    it("should not be able to delete as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), `games/${gameId}`), {
          name: "Test Game",
        })
        await setDoc(doc(context.firestore(), mapPath), {
          name: "Test Map",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(deleteDoc(doc(iconoDb, mapPath)))
    })
  })

  describe("spherical collection", () => {
    it("should be able to read a doc even if not logged in", async () => {
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

    it("should not be able to create a doc while not admin", async () => {
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

    it("should not be able to update a doc while not admin", async () => {
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

    it("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, "spherical/spherical1"), {
          name: "Test Spherical",
        }),
      )
    })

    it("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
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

    it("should be able to delete as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "spherical/spherical1"), {
          name: "Test Spherical",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, "spherical/spherical1")))
    })

    it("should be able to create as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(iconoDb, "spherical/spherical1"), {
          name: "Test Spherical",
        }),
      )
    })

    it("should be able to update as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), "spherical/spherical1"), {
          name: "Test Spherical",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(iconoDb, "spherical/spherical1"), {
          name: "Updated Spherical",
        }),
      )
    })

    it("should not be able to delete as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), "spherical/spherical1"), {
          name: "Test Spherical",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(deleteDoc(doc(iconoDb, "spherical/spherical1")))
    })
  })

  describe("collectionGroup queries", () => {
    describe("spherical collectionGroup", () => {
      it("should be able to read spherical docs via collectionGroup even if not logged in", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/spherical/s1"), {
            name: "Spherical 1",
          })
          await setDoc(doc(context.firestore(), "games/game2"), {
            name: "Test Game 2",
          })
          await setDoc(doc(context.firestore(), "games/game2/spherical/s2"), {
            name: "Spherical 2",
          })
        })

        const unauthedDb = testEnv.unauthenticatedContext().firestore()

        const result = await assertSucceeds(
          getDocs(collectionGroup(unauthedDb, "spherical")),
        )

        expect(result.docs.length).toBe(2)
      })

      it("should not be able to write via collectionGroup path while not admin or iconograph", async () => {
        const uid = "user1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await assertFails(
          setDoc(doc(authedUserDb, "games/game1/spherical/s1"), {
            name: "Test Spherical",
          }),
        )
      })

      it("should be able to write via collectionGroup path as admin", async () => {
        const uid = "admin1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "admin",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const adminDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          setDoc(doc(adminDb, "games/game1/spherical/s1"), {
            name: "Test Spherical",
          }),
        )
      })

      it("should be able to delete via collectionGroup path as admin", async () => {
        const uid = "admin1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "admin",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/spherical/s1"), {
            name: "Test Spherical",
          })
        })

        const adminDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          deleteDoc(doc(adminDb, "games/game1/spherical/s1")),
        )
      })

      it("should be able to create via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          setDoc(doc(iconoDb, "games/game1/spherical/s1"), {
            name: "Test Spherical",
          }),
        )
      })

      it("should be able to update via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/spherical/s1"), {
            name: "Test Spherical",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          updateDoc(doc(iconoDb, "games/game1/spherical/s1"), {
            name: "Updated Spherical",
          }),
        )
      })

      it("should not be able to delete via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/spherical/s1"), {
            name: "Test Spherical",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertFails(
          deleteDoc(doc(iconoDb, "games/game1/spherical/s1")),
        )
      })
    })

    describe("maps collectionGroup", () => {
      it("should be able to read maps docs via collectionGroup even if not logged in", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/maps/m1"), {
            name: "Map 1",
          })
          await setDoc(doc(context.firestore(), "games/game2"), {
            name: "Test Game 2",
          })
          await setDoc(doc(context.firestore(), "games/game2/maps/m2"), {
            name: "Map 2",
          })
        })

        const unauthedDb = testEnv.unauthenticatedContext().firestore()

        const result = await assertSucceeds(
          getDocs(collectionGroup(unauthedDb, "maps")),
        )

        expect(result.docs.length).toBe(2)
      })

      it("should not be able to write via collectionGroup path while not admin or iconograph", async () => {
        const uid = "user1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await assertFails(
          setDoc(doc(authedUserDb, "games/game1/maps/m1"), {
            name: "Test Map",
          }),
        )
      })

      it("should be able to write via collectionGroup path as admin", async () => {
        const uid = "admin1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "admin",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const adminDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          setDoc(doc(adminDb, "games/game1/maps/m1"), {
            name: "Test Map",
          }),
        )
      })

      it("should be able to delete via collectionGroup path as admin", async () => {
        const uid = "admin1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "admin",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/maps/m1"), {
            name: "Test Map",
          })
        })

        const adminDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(deleteDoc(doc(adminDb, "games/game1/maps/m1")))
      })

      it("should be able to create via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          setDoc(doc(iconoDb, "games/game1/maps/m1"), {
            name: "Test Map",
          }),
        )
      })

      it("should be able to update via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/maps/m1"), {
            name: "Test Map",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          updateDoc(doc(iconoDb, "games/game1/maps/m1"), {
            name: "Updated Map",
          }),
        )
      })

      it("should not be able to delete via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/maps/m1"), {
            name: "Test Map",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertFails(deleteDoc(doc(iconoDb, "games/game1/maps/m1")))
      })
    })

    describe("flat collectionGroup", () => {
      it("should be able to read flat docs via collectionGroup even if not logged in", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/flat/f1"), {
            name: "Flat 1",
          })
          await setDoc(doc(context.firestore(), "games/game2"), {
            name: "Test Game 2",
          })
          await setDoc(doc(context.firestore(), "games/game2/flat/f2"), {
            name: "Flat 2",
          })
        })

        const unauthedDb = testEnv.unauthenticatedContext().firestore()

        const result = await assertSucceeds(
          getDocs(collectionGroup(unauthedDb, "flat")),
        )

        expect(result.docs.length).toBe(2)
      })

      it("should not be able to write via collectionGroup path while not admin or iconograph", async () => {
        const uid = "user1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const authedUserDb = testEnv.authenticatedContext(uid).firestore()

        await assertFails(
          setDoc(doc(authedUserDb, "games/game1/flat/f1"), {
            name: "Test Flat",
          }),
        )
      })

      it("should be able to write via collectionGroup path as admin", async () => {
        const uid = "admin1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "admin",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const adminDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          setDoc(doc(adminDb, "games/game1/flat/f1"), {
            name: "Test Flat",
          }),
        )
      })

      it("should be able to delete via collectionGroup path as admin", async () => {
        const uid = "admin1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "admin",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/flat/f1"), {
            name: "Test Flat",
          })
        })

        const adminDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(deleteDoc(doc(adminDb, "games/game1/flat/f1")))
      })

      it("should be able to create via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          setDoc(doc(iconoDb, "games/game1/flat/f1"), {
            name: "Test Flat",
          }),
        )
      })

      it("should be able to update via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/flat/f1"), {
            name: "Test Flat",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertSucceeds(
          updateDoc(doc(iconoDb, "games/game1/flat/f1"), {
            name: "Updated Flat",
          }),
        )
      })

      it("should not be able to delete via collectionGroup path as iconograph", async () => {
        const uid = "icono1"

        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), `rights/${uid}`), {
            uid,
            right: "iconograph",
          })
          await setDoc(doc(context.firestore(), "games/game1"), {
            name: "Test Game",
          })
          await setDoc(doc(context.firestore(), "games/game1/flat/f1"), {
            name: "Test Flat",
          })
        })

        const iconoDb = testEnv.authenticatedContext(uid).firestore()

        await assertFails(deleteDoc(doc(iconoDb, "games/game1/flat/f1")))
      })
    })
  })

  describe("seeds collection", () => {
    it("should be able to read a doc even if not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "seeds/seed1"), {
          name: "Test Seed",
        })
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      const result = await assertSucceeds(getDoc(doc(unauthedDb, "seeds/seed1")))

      expect(result).toBeDefined()
    })

    it("should be able to read a doc as logged in user", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "seeds/seed1"), {
          name: "Test Seed",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, "seeds/seed1")),
      )

      expect(result).toBeDefined()
    })

    it("should be able to write as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, "seeds/seed1"), { name: "Test Seed" }),
      )
    })

    it("should be able to update as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "seeds/seed1"), {
          name: "Test Seed",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, "seeds/seed1"), { name: "Updated Seed" }),
      )
    })

    it("should be able to delete as admin", async () => {
      const uid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "seeds/seed1"), {
          name: "Test Seed",
        })
      })

      const adminDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, "seeds/seed1")))
    })

    it("should not be able to write as regular user", async () => {
      const uid = "user1"

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(authedUserDb, "seeds/seed1"), { name: "Test Seed" }),
      )
    })

    it("should not be able to write as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(iconoDb, "seeds/seed1"), { name: "Test Seed" }),
      )
    })

    it("should not be able to write when not logged in", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        setDoc(doc(unauthedDb, "seeds/seed1"), { name: "Test Seed" }),
      )
    })
  })

  describe("suggestions collection", () => {
    const createSuggestionData = (createdBy: string) => ({
      createdBy,
      text: "My suggestion",
      createdAt: new Date().toISOString(),
    })

    it("should be able to create a suggestion when logged in", async () => {
      const uid = "user1"

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(
          doc(authedUserDb, "suggestions/suggestion1"),
          createSuggestionData(uid),
        ),
      )
    })

    it("should be able to create a suggestion when not logged in", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertSucceeds(
        setDoc(
          doc(unauthedDb, "suggestions/suggestion1"),
          createSuggestionData("anonymous"),
        ),
      )
    })

    it("should be able to read own suggestion as owner (createdBy)", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData(uid),
        )
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        getDoc(doc(authedUserDb, "suggestions/suggestion1")),
      )
    })

    it("should not be able to read another user's suggestion", async () => {
      const uid = "user1"
      const otherUid = "user2"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData(otherUid),
        )
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        getDoc(doc(authedUserDb, "suggestions/suggestion1")),
      )
    })

    it("should not be able to read a suggestion when not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData("user1"),
        )
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        getDoc(doc(unauthedDb, "suggestions/suggestion1")),
      )
    })

    it("should be able to read any suggestion as admin", async () => {
      const adminUid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData("user1"),
        )
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        getDoc(doc(adminDb, "suggestions/suggestion1")),
      )
    })

    it("should be able to update a suggestion as admin", async () => {
      const adminUid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData("user1"),
        )
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, "suggestions/suggestion1"), {
          text: "Updated suggestion",
        }),
      )
    })

    it("should be able to delete a suggestion as admin", async () => {
      const adminUid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData("user1"),
        )
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        deleteDoc(doc(adminDb, "suggestions/suggestion1")),
      )
    })

    it("should not be able to update a suggestion as regular user", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData(uid),
        )
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, "suggestions/suggestion1"), {
          text: "Updated suggestion",
        }),
      )
    })

    it("should not be able to delete a suggestion as regular user", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData(uid),
        )
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        deleteDoc(doc(authedUserDb, "suggestions/suggestion1")),
      )
    })

    it("should not be able to update a suggestion when not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData("user1"),
        )
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        updateDoc(doc(unauthedDb, "suggestions/suggestion1"), {
          text: "Updated suggestion",
        }),
      )
    })

    it("should not be able to delete a suggestion when not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "suggestions/suggestion1"),
          createSuggestionData("user1"),
        )
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        deleteDoc(doc(unauthedDb, "suggestions/suggestion1")),
      )
    })
  })

  describe("socials collection", () => {
    it("should be able to read as admin", async () => {
      const adminUid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(getDoc(doc(adminDb, "socials/social1")))
    })

    it("should be able to create as admin", async () => {
      const adminUid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        setDoc(doc(adminDb, "socials/social1"), { name: "Test Social" }),
      )
    })

    it("should be able to update as admin", async () => {
      const adminUid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(
        updateDoc(doc(adminDb, "socials/social1"), { name: "Updated Social" }),
      )
    })

    it("should be able to delete as admin", async () => {
      const adminUid = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminUid}`), {
          uid: adminUid,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminUid).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, "socials/social1")))
    })

    it("should not be able to read as regular user", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(getDoc(doc(authedUserDb, "socials/social1")))
    })

    it("should not be able to create as regular user", async () => {
      const uid = "user1"

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(authedUserDb, "socials/social1"), { name: "Test Social" }),
      )
    })

    it("should not be able to update as regular user", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        updateDoc(doc(authedUserDb, "socials/social1"), {
          name: "Updated Social",
        }),
      )
    })

    it("should not be able to delete as regular user", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(deleteDoc(doc(authedUserDb, "socials/social1")))
    })

    it("should not be able to read as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(getDoc(doc(iconoDb, "socials/social1")))
    })

    it("should not be able to write as iconograph", async () => {
      const uid = "icono1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${uid}`), {
          uid,
          right: "iconograph",
        })
      })

      const iconoDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(
        setDoc(doc(iconoDb, "socials/social1"), { name: "Test Social" }),
      )
    })

    it("should not be able to read when not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "socials/social1"), {
          name: "Test Social",
        })
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(getDoc(doc(unauthedDb, "socials/social1")))
    })

    it("should not be able to write when not logged in", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        setDoc(doc(unauthedDb, "socials/social1"), { name: "Test Social" }),
      )
    })
  })

  describe("lobbies collection", () => {
    const createLobbyData = (hostId: string, playerUids: string[]) => ({
      code: "ABC123",
      hostId,
      status: "waiting",
      players: playerUids.map((uid) => ({
        uid,
        name: `Player ${uid}`,
        avatar: "",
        score: 0,
        isHost: uid === hostId,
        isReady: false,
      })),
      config: {
        playersLives: 3,
        maxPlayers: 8,
        roundDuration: 30,
        numberOfRounds: 5,
      },
      currentRound: 0,
    })

    it("should be able to create a lobby when logged in", async () => {
      const uid = "user1"

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(
        setDoc(doc(authedUserDb, "lobbies/lobby1"), createLobbyData(uid, [uid])),
      )
    })

    it("should not be able to create a lobby when not logged in", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        setDoc(
          doc(unauthedDb, "lobbies/lobby1"),
          createLobbyData("user1", ["user1"]),
        ),
      )
    })

    it("should be able to read lobby as a player", async () => {
      const hostId = "host1"
      const playerId = "player1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId, playerId]),
        )
      })

      const playerDb = testEnv.authenticatedContext(playerId).firestore()

      const result = await assertSucceeds(
        getDoc(doc(playerDb, "lobbies/lobby1")),
      )

      expect(result).toBeDefined()
    })

    it("should be able to read lobby as logged in user (for joining by code)", async () => {
      const hostId = "host1"
      const outsiderId = "outsider1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId]),
        )
      })

      const outsiderDb = testEnv.authenticatedContext(outsiderId).firestore()

      const result = await assertSucceeds(getDoc(doc(outsiderDb, "lobbies/lobby1")))

      expect(result).toBeDefined()
    })

    it("should be able to read lobby when not logged in", async () => {
      const hostId = "host1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId]),
        )
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertSucceeds(getDoc(doc(unauthedDb, "lobbies/lobby1")))
    })

    it("should be able to update lobby as a player", async () => {
      const hostId = "host1"
      const playerId = "player1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId, playerId]),
        )
      })

      const playerDb = testEnv.authenticatedContext(playerId).firestore()

      await assertSucceeds(
        updateDoc(doc(playerDb, "lobbies/lobby1"), { status: "playing" }),
      )
    })

    it("should be able to join a lobby (update with self added to players)", async () => {
      const hostId = "host1"
      const newPlayerId = "newPlayer1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId]),
        )
      })

      const newPlayerDb = testEnv.authenticatedContext(newPlayerId).firestore()

      await assertSucceeds(
        updateDoc(doc(newPlayerDb, "lobbies/lobby1"), {
          players: [
            {
              uid: hostId,
              name: "Player host1",
              avatar: "",
              score: 0,
              isHost: true,
              isReady: false,
            },
            {
              uid: newPlayerId,
              name: "New Player",
              avatar: "",
              score: 0,
              isHost: false,
              isReady: false,
            },
          ],
        }),
      )
    })

    // TODO: enable it after fixing rules roundAnswers when users is not a player correctly
    it.skip("should not be able to update lobby if not a player", async () => {
      const hostId = "host1"
      const outsiderId = "outsider1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId]),
        )
      })

      const outsiderDb = testEnv.authenticatedContext(outsiderId).firestore()

      await assertFails(
        updateDoc(doc(outsiderDb, "lobbies/lobby1"), { status: "playing" }),
      )
    })

    it("should be able to delete lobby as admin", async () => {
      const adminId = "admin1"
      const hostId = "host1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), {
          uid: adminId,
          right: "admin",
        })
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId]),
        )
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, "lobbies/lobby1")))
    })

    it("should not be able to delete lobby as player (non-admin)", async () => {
      const hostId = "host1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId]),
        )
      })

      const hostDb = testEnv.authenticatedContext(hostId).firestore()

      await assertFails(deleteDoc(doc(hostDb, "lobbies/lobby1")))
    })

    it("should not be able to delete lobby as regular user", async () => {
      const hostId = "host1"
      const userId = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "lobbies/lobby1"),
          createLobbyData(hostId, [hostId]),
        )
      })

      const userDb = testEnv.authenticatedContext(userId).firestore()

      await assertFails(deleteDoc(doc(userDb, "lobbies/lobby1")))
    })
  })

  describe("roundAnswers subcollection (lobbies/{lobbyId}/roundAnswers)", () => {
    const createLobbyData = (hostId: string, playerUids: string[]) => ({
      code: "ABC123",
      hostId,
      status: "playing",
      players: playerUids.map((uid) => ({
        uid,
        name: `Player ${uid}`,
        avatar: "",
        score: 0,
        isHost: uid === hostId,
        isReady: false,
      })),
      config: {
        playersLives: 3,
        maxPlayers: 8,
        roundDuration: 30,
        numberOfRounds: 5,
      },
      currentRound: 1,
    })

    const lobbyId = "lobby1"
    const answerPath = `lobbies/${lobbyId}/roundAnswers/answer1`

    it("should be able to create a roundAnswer as a player", async () => {
      const hostId = "host1"
      const playerId = "player1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId, playerId]),
        )
      })

      const playerDb = testEnv.authenticatedContext(playerId).firestore()

      await assertSucceeds(
        setDoc(doc(playerDb, answerPath), {
          playerId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        }),
      )
    })

    // TODO: enable it after fixing rules roundAnswers when users is not a player correctly
    it.skip("should not be able to create a roundAnswer if not a player", async () => {
      const hostId = "host1"
      const outsiderId = "outsider1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId]),
        )
      })

      const outsiderDb = testEnv.authenticatedContext(outsiderId).firestore()

      await assertFails(
        setDoc(doc(outsiderDb, answerPath), {
          playerId: outsiderId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        }),
      )
    })

    it("should not be able to create a roundAnswer when not logged in", async () => {
      const hostId = "host1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId]),
        )
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        setDoc(doc(unauthedDb, answerPath), {
          playerId: "someone",
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        }),
      )
    })

    it("should be able to read roundAnswers as a player", async () => {
      const hostId = "host1"
      const playerId = "player1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId, playerId]),
        )
        await setDoc(doc(context.firestore(), answerPath), {
          playerId: hostId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        })
      })

      const playerDb = testEnv.authenticatedContext(playerId).firestore()

      const result = await assertSucceeds(getDoc(doc(playerDb, answerPath)))

      expect(result).toBeDefined()
    })

    // TODO: enable it after fixing rules roundAnswers when users is not a player correctly
    it.skip("should not be able to read roundAnswers if not a player", async () => {
      const hostId = "host1"
      const outsiderId = "outsider1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId]),
        )
        await setDoc(doc(context.firestore(), answerPath), {
          playerId: hostId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        })
      })

      const outsiderDb = testEnv.authenticatedContext(outsiderId).firestore()

      await assertFails(getDoc(doc(outsiderDb, answerPath)))
    })

    it("should be able to update roundAnswers as a player", async () => {
      const hostId = "host1"
      const playerId = "player1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId, playerId]),
        )
        await setDoc(doc(context.firestore(), answerPath), {
          playerId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        })
      })

      const playerDb = testEnv.authenticatedContext(playerId).firestore()

      await assertSucceeds(
        updateDoc(doc(playerDb, answerPath), {
          answer: { lat: 51.5074, lng: -0.1278 },
        }),
      )
    })

    // TODO: enable it after fixing rules roundAnswers when users is not a player correctly
    it.skip("should not be able to update roundAnswers if not a player", async () => {
      const hostId = "host1"
      const outsiderId = "outsider1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId]),
        )
        await setDoc(doc(context.firestore(), answerPath), {
          playerId: hostId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        })
      })

      const outsiderDb = testEnv.authenticatedContext(outsiderId).firestore()

      await assertFails(
        updateDoc(doc(outsiderDb, answerPath), {
          answer: { lat: 51.5074, lng: -0.1278 },
        }),
      )
    })

    it("should be able to delete roundAnswers as admin", async () => {
      const adminId = "admin1"
      const hostId = "host1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), {
          uid: adminId,
          right: "admin",
        })
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId]),
        )
        await setDoc(doc(context.firestore(), answerPath), {
          playerId: hostId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        })
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()

      await assertSucceeds(deleteDoc(doc(adminDb, answerPath)))
    })

    it("should not be able to delete roundAnswers as player (non-admin)", async () => {
      const hostId = "host1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId]),
        )
        await setDoc(doc(context.firestore(), answerPath), {
          playerId: hostId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        })
      })

      const hostDb = testEnv.authenticatedContext(hostId).firestore()

      await assertFails(deleteDoc(doc(hostDb, answerPath)))
    })

    it("should not be able to delete roundAnswers as outsider", async () => {
      const hostId = "host1"
      const outsiderId = "outsider1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), `lobbies/${lobbyId}`),
          createLobbyData(hostId, [hostId]),
        )
        await setDoc(doc(context.firestore(), answerPath), {
          playerId: hostId,
          round: 1,
          answer: { lat: 48.8566, lng: 2.3522 },
        })
      })

      const outsiderDb = testEnv.authenticatedContext(outsiderId).firestore()

      await assertFails(deleteDoc(doc(outsiderDb, answerPath)))
    })
  })

  describe("dailyChallenges collection", () => {
    const challengeData = {
      date: "2026-03-09",
      isSpherical: true,
      sphericalId: "spherical1",
      sphericalImageUrl: "https://example.com/image.jpg",
      gameId: "game1",
      gameTitle: "Grand Theft Auto V",
      gameAlternateNames: ["GTA V", "GTA 5"],
      difficulty: "EASY",
      createdBy: "admin1",
    }

    it("should be able to read a daily challenge when not logged in", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "dailyChallenges/2026-03-09"), challengeData)
      })

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      const result = await assertSucceeds(getDoc(doc(unauthedDb, "dailyChallenges/2026-03-09")))
      expect(result).toBeDefined()
    })

    it("should be able to read a daily challenge when logged in", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "dailyChallenges/2026-03-09"), challengeData)
      })

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(getDoc(doc(authedDb, "dailyChallenges/2026-03-09")))
      expect(result).toBeDefined()
    })

    it("should not be able to create a daily challenge as a regular user", async () => {
      const uid = "user1"

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(setDoc(doc(authedDb, "dailyChallenges/2026-03-09"), challengeData))
    })

    it("should not be able to create a daily challenge when not logged in", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(setDoc(doc(unauthedDb, "dailyChallenges/2026-03-09"), challengeData))
    })

    it("should be able to create a daily challenge as admin", async () => {
      const adminId = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), {
          uid: adminId,
          right: "admin",
        })
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()

      await assertSucceeds(setDoc(doc(adminDb, "dailyChallenges/2026-03-09"), challengeData))
    })

    it("should be able to update a daily challenge as admin", async () => {
      const adminId = "admin1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), {
          uid: adminId,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), "dailyChallenges/2026-03-09"), challengeData)
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()

      await assertSucceeds(updateDoc(doc(adminDb, "dailyChallenges/2026-03-09"), { difficulty: "HARD" }))
    })

    it("should not be able to update a daily challenge as a regular user", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "dailyChallenges/2026-03-09"), challengeData)
      })

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(updateDoc(doc(authedDb, "dailyChallenges/2026-03-09"), { difficulty: "HARD" }))
    })
  })

  describe("dailyChallengeResults subcollection", () => {
    const resultData = {
      date: "2026-03-09",
      answer: "GTA V",
      isCorrect: true,
    }

    const resultPath = (uid: string) => `users/${uid}/dailyChallengeResults/2026-03-09`

    it("should be able to create own daily challenge result when logged in", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), { pseudo: "Player1" })
      })

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      await assertSucceeds(setDoc(doc(authedDb, resultPath(uid)), resultData))
    })

    it("should not be able to create a result for another user", async () => {
      const uid = "user1"
      const otherUid = "user2"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${otherUid}`), { pseudo: "Player2" })
      })

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(setDoc(doc(authedDb, resultPath(otherUid)), resultData))
    })

    it("should not be able to create a result when not logged in", async () => {
      const uid = "user1"

      const unauthedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(setDoc(doc(unauthedDb, resultPath(uid)), resultData))
    })

    it("should be able to read own daily challenge result", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), { pseudo: "Player1" })
        await setDoc(doc(context.firestore(), resultPath(uid)), resultData)
      })

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(getDoc(doc(authedDb, resultPath(uid))))
      expect(result).toBeDefined()
    })

    it("should not be able to read another user's daily challenge result", async () => {
      const uid = "user1"
      const otherUid = "user2"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${otherUid}`), { pseudo: "Player2" })
        await setDoc(doc(context.firestore(), resultPath(otherUid)), resultData)
      })

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(getDoc(doc(authedDb, resultPath(otherUid))))
    })

    it("should not be able to update own result (immutable)", async () => {
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), { pseudo: "Player1" })
        await setDoc(doc(context.firestore(), resultPath(uid)), resultData)
      })

      const authedDb = testEnv.authenticatedContext(uid).firestore()

      await assertFails(updateDoc(doc(authedDb, resultPath(uid)), { isCorrect: false }))
    })

    it("should be able to read and write any result as admin", async () => {
      const adminId = "admin1"
      const uid = "user1"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), {
          uid: adminId,
          right: "admin",
        })
        await setDoc(doc(context.firestore(), `users/${uid}`), { pseudo: "Player1" })
        await setDoc(doc(context.firestore(), resultPath(uid)), resultData)
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()

      const result = await assertSucceeds(getDoc(doc(adminDb, resultPath(uid))))
      expect(result).toBeDefined()

      await assertSucceeds(updateDoc(doc(adminDb, resultPath(uid)), { isCorrect: false }))
    })
  })

  describe("marathonSeeds collection", () => {
    const seedId = "seed1"
    const seedPath = `marathonSeeds/${seedId}`
    const seedData = { name: "Test Seed", rounds: [], gamesUsed: [] }
    const adminId = "admin1"

    it("should allow anyone to read a marathon seed", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), seedPath), seedData)
      })

      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertSucceeds(getDoc(doc(unauthDb, seedPath)))
    })

    it("should not allow unauthenticated users to write a marathon seed", async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(setDoc(doc(unauthDb, seedPath), seedData))
    })

    it("should allow regular users to create a marathon seed", async () => {
      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertSucceeds(setDoc(doc(authedDb, seedPath), seedData))
    })

    it("should not allow regular users to update a marathon seed", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), seedPath), seedData)
      })

      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertFails(updateDoc(doc(authedDb, seedPath), { name: "Updated" }))
    })

    it("should not allow regular users to delete a marathon seed", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), seedPath), seedData)
      })

      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertFails(deleteDoc(doc(authedDb, seedPath)))
    })

    it("should allow admin to write a marathon seed", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), { uid: adminId, right: "admin" })
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()
      await assertSucceeds(setDoc(doc(adminDb, seedPath), seedData))
    })
  })

  describe("races collection", () => {
    const raceId = "race1"
    const racePath = `races/${raceId}`
    const raceData = { code: "ABCD", hostId: "user1", seedId: "seed1", status: "waiting", players: [], playersIds: [], duration: 300 }

    it("should allow signed-in user to create a race", async () => {
      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertSucceeds(setDoc(doc(authedDb, racePath), raceData))
    })

    it("should not allow unauthenticated user to create a race", async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(setDoc(doc(unauthDb, racePath), raceData))
    })

    it("should allow signed-in user to read a race", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), racePath), raceData)
      })

      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertSucceeds(getDoc(doc(authedDb, racePath)))
    })

    it("should not allow unauthenticated user to read a race", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), racePath), raceData)
      })

      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(getDoc(doc(unauthDb, racePath)))
    })

    it("should allow signed-in user to update a race", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), racePath), raceData)
      })

      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertSucceeds(updateDoc(doc(authedDb, racePath), { status: "playing" }))
    })

    it("should not allow unauthenticated user to delete a race", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), racePath), raceData)
      })

      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(deleteDoc(doc(unauthDb, racePath)))
    })

    describe("raceRuns subcollection", () => {
      const uid = "user1"
      const runId = "run1"
      const runPath = `races/${raceId}/raceRuns/${runId}`
      const runData = { uid, score: 0, currentRoundIndex: 0, answers: [] }

      it("should allow owner to create their own run", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), racePath), raceData)
        })

        const authedDb = testEnv.authenticatedContext(uid).firestore()
        await assertSucceeds(setDoc(doc(authedDb, runPath), runData))
      })

      it("should not allow user to create a run with a different uid", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), racePath), raceData)
        })

        const authedDb = testEnv.authenticatedContext("other-user").firestore()
        await assertFails(setDoc(doc(authedDb, runPath), runData))
      })

      it("should not allow unauthenticated user to create a run", async () => {
        const unauthDb = testEnv.unauthenticatedContext().firestore()
        await assertFails(setDoc(doc(unauthDb, runPath), runData))
      })

      it("should allow any signed-in user to read runs", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), racePath), raceData)
          await setDoc(doc(context.firestore(), runPath), runData)
        })

        const authedDb = testEnv.authenticatedContext("other-user").firestore()
        await assertSucceeds(getDoc(doc(authedDb, runPath)))
      })

      it("should allow owner to update their own run", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), racePath), raceData)
          await setDoc(doc(context.firestore(), runPath), runData)
        })

        const authedDb = testEnv.authenticatedContext(uid).firestore()
        await assertSucceeds(updateDoc(doc(authedDb, runPath), { score: 100 }))
      })

      it("should not allow another user to update someone else's run", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), racePath), raceData)
          await setDoc(doc(context.firestore(), runPath), runData)
        })

        const authedDb = testEnv.authenticatedContext("other-user").firestore()
        await assertFails(updateDoc(doc(authedDb, runPath), { score: 999 }))
      })
    })
  })

  describe("leaderboard collection", () => {
    const entryId = "entry1"
    const entryPath = `leaderboard/${entryId}`
    const entryData = { uid: "user1", pseudo: "Player1", avatar: "default", score: 500, roundsCompleted: 5, seedId: "seed1", seedName: "Test Seed", raceId: "race1" }
    const adminId = "admin1"

    it("should allow anyone to read leaderboard entries", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), entryPath), entryData)
      })

      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertSucceeds(getDoc(doc(unauthDb, entryPath)))
    })

    it("should not allow regular users to write leaderboard entries", async () => {
      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertFails(setDoc(doc(authedDb, entryPath), entryData))
    })

    it("should allow admin to write leaderboard entries", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), { uid: adminId, right: "admin" })
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()
      await assertSucceeds(setDoc(doc(adminDb, entryPath), entryData))
    })
  })

  describe("coupons collection", () => {
    const adminId = "admin1"
    const couponPath = "coupons/coupon1"
    const couponData = {
      code: "ABCD1234",
      tier: "bronze",
      bmcEmail: "supporter@example.com",
      claimedBy: null,
      claimedAt: null,
      createdAt: null,
      expiresAt: null,
    }

    it("should not allow unauthenticated users to read a coupon", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), couponPath), couponData)
      })

      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(getDoc(doc(unauthDb, couponPath)))
    })

    it("should not allow authenticated users to read a coupon", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), couponPath), couponData)
      })

      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertFails(getDoc(doc(authedDb, couponPath)))
    })

    it("should not allow authenticated users to write a coupon", async () => {
      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertFails(setDoc(doc(authedDb, couponPath), couponData))
    })

    it("should not allow unauthenticated users to write a coupon", async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(setDoc(doc(unauthDb, couponPath), couponData))
    })

    it("should not allow a user to read another user's coupon by guessing the path", async () => {
      const otherCouponPath = "coupons/someOtherCoupon"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), otherCouponPath), { ...couponData, claimedBy: "user2" })
      })

      const authedDb = testEnv.authenticatedContext("user1").firestore()
      await assertFails(getDoc(doc(authedDb, otherCouponPath)))
    })

    it("should allow admin to read a coupon", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), { uid: adminId, right: "admin" })
        await setDoc(doc(context.firestore(), couponPath), couponData)
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()
      await assertSucceeds(getDoc(doc(adminDb, couponPath)))
    })

    it("should allow admin to write a coupon", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), { uid: adminId, right: "admin" })
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()
      await assertSucceeds(setDoc(doc(adminDb, couponPath), couponData))
    })
  })

  describe("messages collection", () => {
    const adminId = "admin1"
    const targetUserId = "user1"
    const otherUserId = "user2"
    const lobbyId = "lobby123"
    const userMessagePath = "messages/msg1"
    const lobbyMessagePath = "messages/msg2"

    const userMessageData = {
      content: "Hello user",
      targetType: "user",
      targetId: targetUserId,
      seenBy: [],
      createdAt: new Date(),
    }

    const lobbyMessageData = {
      content: "Hello lobby",
      targetType: "lobby",
      targetId: lobbyId,
      seenBy: [],
      createdAt: new Date(),
    }

    it("should allow admin to create a message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), { uid: adminId, right: "admin" })
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()
      await assertSucceeds(setDoc(doc(adminDb, userMessagePath), userMessageData))
    })

    it("should allow admin to delete a message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `rights/${adminId}`), { uid: adminId, right: "admin" })
        await setDoc(doc(context.firestore(), userMessagePath), userMessageData)
      })

      const adminDb = testEnv.authenticatedContext(adminId).firestore()
      await assertSucceeds(deleteDoc(doc(adminDb, userMessagePath)))
    })

    it("should not allow regular user to create a message", async () => {
      const authedDb = testEnv.authenticatedContext(targetUserId).firestore()
      await assertFails(setDoc(doc(authedDb, userMessagePath), userMessageData))
    })

    it("should not allow unauthenticated user to read a message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), userMessagePath), userMessageData)
      })

      const unauthDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(getDoc(doc(unauthDb, userMessagePath)))
    })

    it("should allow target user to read their own message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), userMessagePath), userMessageData)
      })

      const authedDb = testEnv.authenticatedContext(targetUserId).firestore()
      await assertSucceeds(getDoc(doc(authedDb, userMessagePath)))
    })

    it("should not allow other user to read a user-targeted message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), userMessagePath), userMessageData)
      })

      const authedDb = testEnv.authenticatedContext(otherUserId).firestore()
      await assertFails(getDoc(doc(authedDb, userMessagePath)))
    })

    it("should allow any signed-in user to read a lobby-targeted message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), lobbyMessagePath), lobbyMessageData)
      })

      const authedDb = testEnv.authenticatedContext(otherUserId).firestore()
      await assertSucceeds(getDoc(doc(authedDb, lobbyMessagePath)))
    })

    it("should allow signed-in user to update seenBy on a message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), lobbyMessagePath), lobbyMessageData)
      })

      const authedDb = testEnv.authenticatedContext(otherUserId).firestore()
      await assertSucceeds(updateDoc(doc(authedDb, lobbyMessagePath), { seenBy: [otherUserId] }))
    })

    it("should not allow signed-in user to update fields other than seenBy", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), lobbyMessagePath), lobbyMessageData)
      })

      const authedDb = testEnv.authenticatedContext(otherUserId).firestore()
      await assertFails(updateDoc(doc(authedDb, lobbyMessagePath), { content: "hacked" }))
    })

    it("should not allow regular user to delete a message", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), userMessagePath), userMessageData)
      })

      const authedDb = testEnv.authenticatedContext(targetUserId).firestore()
      await assertFails(deleteDoc(doc(authedDb, userMessagePath)))
    })
  })
})
