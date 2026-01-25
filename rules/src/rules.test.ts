import {
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { readFileSync } from "node:fs"
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest"
import { generateCoverageReport } from "./utils"

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

    test("should not be able to write other doc if not admin", async () => {
      const uid = "uid"

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${uid}`), {
          uid,
          rights: ["admin"],
        })
      })

      const authedUserDb = testEnv.authenticatedContext(uid).firestore()

      const result = await assertSucceeds(
        getDoc(doc(authedUserDb, `users/${uid}`)),
      )

      expect(result).toBeDefined()
    })
  })
})
