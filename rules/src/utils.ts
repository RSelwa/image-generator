import { execSync } from "node:child_process"
import { createWriteStream } from "node:fs"
import { get } from "node:http"
import { type RulesTestEnvironment } from "@firebase/rules-unit-testing"
import { doc, setDoc } from "firebase/firestore"

export async function generateCoverageReport(urlCoverageJson: string) {
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

export async function setupUserRole(
  testEnv: RulesTestEnvironment,
  uid: string,
  status: string,
) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `rights/${uid}`), {
      access: true,
      status,
      uid,
    })
  })
}

export async function setupMedia(testEnv: RulesTestEnvironment, id: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `medias/${id}`), {
      category: "MOVIE",
      original_title: "Mario Bros 1",
      tags: { lvl0: ["Done", "Social"], lvl1: ["Social > Tiktok"] },
    })
  })
}
