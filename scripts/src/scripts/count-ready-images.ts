import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { DOCUMENTS_STATUS, PROJECT_ID, TABLES } from "@repo/common"
import { collectionGroupRefs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"

// Counts ready images using the SAME filters as generateSeedRounds (apps/front/libs/seed.ts),
// so the numbers reflect the real candidate pool size for the seed-generation refactor.
//
// Run: pnpm --filter @repo/scripts run src/scripts/count-ready-images.ts

// --- Diagnostics: confirm WHICH database we're about to read ---
// @repo/providers always uses the project's "(default)" named database (admin.firestore(app)),
// so the only variables are the project and the credential source.
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST

let resolvedProject = "unknown (Application Default Credentials)"

if (credentialsPath) {
  const base = process.env.INIT_CWD || process.cwd()
  const keyFile = JSON.parse(readFileSync(resolve(base, credentialsPath), "utf-8"))
  resolvedProject = `${keyFile.project_id} (from key file ${credentialsPath})`
} else if (serviceAccountKey) {
  resolvedProject = `${JSON.parse(serviceAccountKey).project_id} (from SERVICE_ACCOUNT_KEY)`
}

console.log("=== Target check ===")
console.log(`PROJECT_ID constant: ${PROJECT_ID}`)
console.log(`Credential project:  ${resolvedProject}`)
console.log(`Named database:      (default)  <- the only one @repo/providers ever uses`)
console.log(`Emulator:            ${emulatorHost ? `YES -> ${emulatorHost} (NOT production)` : "no (live Firestore)"}`)
console.log(`SDK databaseId:      ${(db as unknown as { databaseId?: string }).databaseId || "(default)"}`)
console.log("====================\n")

const [sphericalsWithMap, flatsWithMap, sphericalsWithThumbnail, flatsWithThumbnail] =
  await Promise.all([
    collectionGroupRefs[TABLES.SPHERICAL]
      .where("status", "==", DOCUMENTS_STATUS.READY)
      .where("mapId", ">", "")
      .get(),
    collectionGroupRefs[TABLES.FLAT]
      .where("status", "==", DOCUMENTS_STATUS.READY)
      .where("mapId", ">", "")
      .get(),
    collectionGroupRefs[TABLES.SPHERICAL]
      .where("status", "==", DOCUMENTS_STATUS.READY)
      .where("thumbnail", ">", "")
      .get(),
    collectionGroupRefs[TABLES.FLAT]
      .where("status", "==", DOCUMENTS_STATUS.READY)
      .where("thumbnail", ">", "")
      .get(),
  ])

const normalPool = sphericalsWithMap.size + flatsWithMap.size
const specialPool = sphericalsWithThumbnail.size + flatsWithThumbnail.size

// Rough byte estimate for an enriched candidate-pool entry (a pre-formatted normal Round:
// ids + denormalized game/map fields + urls). Used to gauge the 1MB Firestore doc limit.
const APPROX_BYTES_PER_ENTRY = 600
const estimatedNormalBytes = normalPool * APPROX_BYTES_PER_ENTRY

console.log("--- Ready images (normal pool: status=READY & mapId set) ---")
console.log(`sphericals: ${sphericalsWithMap.size}`)
console.log(`flats:      ${flatsWithMap.size}`)
console.log(`total:      ${normalPool}`)
console.log("")
console.log("--- Ready images (special pool: status=READY & thumbnail set) ---")
console.log(`sphericals: ${sphericalsWithThumbnail.size}`)
console.log(`flats:      ${flatsWithThumbnail.size}`)
console.log(`total:      ${specialPool}`)
console.log("")
console.log("--- Candidate-pool size estimate ---")
console.log(`~${APPROX_BYTES_PER_ENTRY} bytes/entry => ~${(estimatedNormalBytes / 1024).toFixed(0)} KB for the normal pool`)
console.log(`Firestore doc limit is ~1024 KB. ${estimatedNormalBytes > 1024 * 1024 ? "OVER limit -> sharding needed." : "Fits in a single doc."}`)
