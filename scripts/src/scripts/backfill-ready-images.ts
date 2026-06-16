import { DOCUMENTS_STATUS, METADATA_DOCS, ROUND_TYPE, TABLES } from "@repo/common"
import { collectionGroupRefs, refs, subRefs } from "@repo/providers/db-refs"
import { buildReadyImageItem, type GameDoc, type MapDoc, type ReadyImageItem, readyImagesDocSchema } from "@repo/schemas"
import { type QuerySnapshot } from "firebase-admin/firestore"

// Rebuilds metadata/READY_IMAGES with the enriched (pre-joined) candidate pool used by
// generateSeedRounds. Run once after deploying the enriched cloud function.
//
// Run (note the credential — must be tiktok-generator-fa261):
//   GOOGLE_APPLICATION_CREDENTIALS=/Users/raphael/image-generator/service-account.json \
//     pnpm --filter @repo/scripts run src/scripts/backfill-ready-images.ts

const gamesCache = new Map<string, GameDoc | undefined>()
const mapsCache = new Map<string, MapDoc | undefined>()

const getGame = async (gameId: string) => {
  if (!gamesCache.has(gameId)) {
    const snap = await refs[TABLES.GAMES].doc(gameId).get()
    gamesCache.set(gameId, snap.data())
  }

  return gamesCache.get(gameId)
}

const getMap = async (gameId: string, mapId: string) => {
  const key = `${gameId}/${mapId}`

  if (!mapsCache.has(key)) {
    const snap = await subRefs[TABLES.MAPS](gameId).doc(mapId).get()
    mapsCache.set(key, snap.data())
  }

  return mapsCache.get(key)
}

const buildEntries = async (
  snapshot: QuerySnapshot,
  type: (typeof ROUND_TYPE)[keyof typeof ROUND_TYPE],
) => {
  const entries: ReadyImageItem[] = []

  for (const doc of snapshot.docs) {
    const data = doc.data()

    if (data.status !== DOCUMENTS_STATUS.READY || !data.image || !data.gameId) continue

    const game = await getGame(data.gameId)
    const map = data.mapId ? await getMap(data.gameId, data.mapId) : null

    const item = buildReadyImageItem({
      type,
      id: doc.id,
      gameId: data.gameId,
      image: data.image,
      thumbnail: data.thumbnail,
      mapId: data.mapId,
      mapPosition: data.mapPosition,
      difficulty: data.difficulty,
      game,
      map,
    })

    if (item) entries.push(item)
  }

  return entries
}

const [sphericalSnap, flatSnap] = await Promise.all([
  collectionGroupRefs[TABLES.SPHERICAL].where("status", "==", DOCUMENTS_STATUS.READY).get(),
  collectionGroupRefs[TABLES.FLAT].where("status", "==", DOCUMENTS_STATUS.READY).get(),
])

const sphericals = await buildEntries(sphericalSnap as QuerySnapshot, ROUND_TYPE.SPHERICAL)
const flats = await buildEntries(flatSnap as QuerySnapshot, ROUND_TYPE.FLAT)

const data = readyImagesDocSchema.parse({ sphericals, flats })

await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).set(data)

console.log(`Backfilled metadata/${METADATA_DOCS.READY_IMAGES}:`)
console.log(`  sphericals: ${sphericals.length} (of ${sphericalSnap.size} ready)`)
console.log(`  flats:      ${flats.length} (of ${flatSnap.size} ready)`)
console.log(`  normal-eligible:  ${[...sphericals, ...flats].filter((i) => i.mapId && i.mapImage).length}`)
console.log(`  special-eligible: ${[...sphericals, ...flats].filter((i) => i.thumbnail).length}`)
