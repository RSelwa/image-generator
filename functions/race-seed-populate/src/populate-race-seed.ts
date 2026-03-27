import { METADATA_DOCS, RACE_SEED_EXTENSION_THRESHOLD, RACE_SEED_ROUNDS_PER_EXTENSION, shuffle, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type MarathonSeedDoc, type MarathonSeedRound, type ReadyImagesDoc } from "@repo/schemas"
import { getFirestore } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

export const populateRaceSeed = async (seedId: string, playerCurrentIndex: number) => {
  const seedRef = refs[TABLES.MARATHON_SEEDS].doc(seedId)
  const seedSnap = await seedRef.get()

  if (!seedSnap.exists) {
    logger.error(`[race-seed-populate] Seed ${seedId} not found`)

    return null
  }

  const seed = seedSnap.data() as MarathonSeedDoc

  // Idempotency check: enough rounds already ahead of this player
  if (seed.rounds.length - playerCurrentIndex > RACE_SEED_EXTENSION_THRESHOLD) {
    logger.info(`[race-seed-populate] Seed ${seedId} has enough rounds, skipping extension`)

    return seed
  }

  // Build exclude sets for deduplication
  const sphericalIdsInSeed = new Set(seed.rounds.filter((r) => r.sphericalId).map((r) => r.sphericalId))
  const flatIdsInSeed = new Set(seed.rounds.filter((r) => r.flatId).map((r) => r.flatId))

  // Read ready images from the single metadata doc instead of querying all sphericals/flats
  const readyImagesSnap = await refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES).get()
  const readyImages = (readyImagesSnap.data() as ReadyImagesDoc | undefined) || { sphericals: [], flats: [] }

  const candidates: MarathonSeedRound[] = []

  for (const s of readyImages.sphericals) {
    if (!s.image || sphericalIdsInSeed.has(s.id)) continue

    candidates.push({ gameId: s.gameId, sphericalId: s.id, sphericalImageUrl: s.image, flatId: null, flatImageUrl: null })
  }

  for (const f of readyImages.flats) {
    if (!f.image || flatIdsInSeed.has(f.id)) continue

    candidates.push({ gameId: f.gameId, sphericalId: null, sphericalImageUrl: null, flatId: f.id, flatImageUrl: f.image })
  }

  if (candidates.length === 0) {
    logger.warn(`[race-seed-populate] No new images found for seed ${seedId}`)

    return seed
  }

  const newRounds = shuffle(candidates).slice(0, RACE_SEED_ROUNDS_PER_EXTENSION)

  // Transaction: re-check before writing to avoid race conditions
  await getFirestore().runTransaction(async (transaction) => {
    const freshSnap = await transaction.get(seedRef)
    const freshSeed = freshSnap.data() as MarathonSeedDoc

    if (freshSeed.rounds.length - playerCurrentIndex > RACE_SEED_EXTENSION_THRESHOLD) {
      logger.info(`[race-seed-populate] Seed ${seedId} was already extended by another player`)

      return
    }

    const freshSphericalIds = new Set(freshSeed.rounds.map((r) => r.sphericalId).filter(Boolean))
    const freshFlatIds = new Set(freshSeed.rounds.map((r) => r.flatId).filter(Boolean))

    const deduplicatedRounds = newRounds.filter((r) =>
      (r.sphericalId && !freshSphericalIds.has(r.sphericalId)) ||
      (r.flatId && !freshFlatIds.has(r.flatId))
    )

    if (deduplicatedRounds.length === 0) return

    transaction.update(seedRef, {
      rounds: [...freshSeed.rounds, ...deduplicatedRounds],
      updatedAt: new Date(),
    })
  })

  logger.info(`[race-seed-populate] Extended seed ${seedId} with ${newRounds.length} rounds`)

  return { ...seed, rounds: [...seed.rounds, ...newRounds] }
}
