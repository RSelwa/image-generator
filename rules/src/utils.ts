import { execSync } from "node:child_process"
import { createWriteStream } from "node:fs"
import { get } from "node:http"
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing"
import { doc, setDoc } from "firebase/firestore"

export const generateCoverageReport = async (urlCoverageJson: string) => {
  const fbCoverageFile = "firestore-coverage.json"

  const fstream = createWriteStream(fbCoverageFile)
  await new Promise((resolve, reject) => {
    get(urlCoverageJson, (res) => {
      res.pipe(fstream, { end: true })
      res.on("end", resolve)
      res.on("error", reject)
    })
  })

  execSync(
    `npx firebase-rules-coverage ${fbCoverageFile} --rules-file src/firestore.rules --output coverage && npx lcov-cli-report-viewer coverage/lcov.info`,
  )
}

export const setupUserRole = async (
  testEnv: RulesTestEnvironment,
  uid: string,
  status: string,
) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `rights/${uid}`), {
      access: true,
      status,
      uid,
    })
  })
}

export const setupMedia = async (testEnv: RulesTestEnvironment, id: string) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `medias/${id}`), {
      category: "MOVIE",
      original_title: "Mario Bros 1",
      tags: { lvl0: ["Done", "Social"], lvl1: ["Social > Tiktok"] },
    })
  })
}
