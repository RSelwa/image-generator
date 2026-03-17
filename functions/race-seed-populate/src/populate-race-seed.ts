import { RACE_SEED_EXTENSION_THRESHOLD, RACE_SEED_IMAGE_FETCH_LIMIT, RACE_SEED_ROUNDS_PER_EXTENSION, shuffle, TABLES } from "@repo/common"
import { collectionGroupRefs, refs } from "@repo/providers/db-refs"
import { type MarathonSeedDoc, type MarathonSeedRound } from "@repo/schemas"
import { FieldPath, getFirestore } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

const FIRESTORE_NOT_IN_LIMIT = 10

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

  // Build exclude lists — collection group queries need full doc paths for documentId() not-in
  const sphericalIdsInSeed = seed.rounds.filter((r) => r.sphericalId).map((r) => r.sphericalId) as string[]
  const flatIdsInSeed = seed.rounds.filter((r) => r.flatId).map((r) => r.flatId) as string[]

  const sphericalPathsExclude = seed.rounds
    .filter((r) => r.sphericalId)
    .slice(-FIRESTORE_NOT_IN_LIMIT)
    .map((r) => `${TABLES.GAMES}/${r.gameId}/${TABLES.SPHERICAL}/${r.sphericalId}`)

  const flatPathsExclude = seed.rounds
    .filter((r) => r.flatId)
    .slice(-FIRESTORE_NOT_IN_LIMIT)
    .map((r) => `${TABLES.GAMES}/${r.gameId}/${TABLES.FLAT}/${r.flatId}`)

  // Fetch sphericals and flats not already in the seed via collection group queries
  const sphericalsQuery = sphericalPathsExclude.length > 0 ? collectionGroupRefs[TABLES.SPHERICAL].where(FieldPath.documentId(), "not-in", sphericalPathsExclude).limit(RACE_SEED_IMAGE_FETCH_LIMIT) : collectionGroupRefs[TABLES.SPHERICAL].limit(RACE_SEED_IMAGE_FETCH_LIMIT)

  const flatsQuery = flatPathsExclude.length > 0 ? collectionGroupRefs[TABLES.FLAT].where(FieldPath.documentId(), "not-in", flatPathsExclude).limit(RACE_SEED_IMAGE_FETCH_LIMIT) : collectionGroupRefs[TABLES.FLAT].limit(RACE_SEED_IMAGE_FETCH_LIMIT)

  const [sphericalsSnap, flatsSnap] = await Promise.all([sphericalsQuery.get(), flatsQuery.get()])

  // Build candidate rounds, client-side filter duplicates missed by the capped not-in
  const candidates: MarathonSeedRound[] = []

  for (const doc of sphericalsSnap.docs) {
    const data = doc.data()

    if (!data.image || sphericalIdsInSeed.includes(doc.id)) continue

    candidates.push({ gameId: data.gameId, sphericalId: doc.id, sphericalImageUrl: data.image, flatId: null, flatImageUrl: null })
  }

  for (const doc of flatsSnap.docs) {
    const data = doc.data()

    if (!data.image || flatIdsInSeed.includes(doc.id)) continue

    candidates.push({ gameId: data.gameId, sphericalId: null, sphericalImageUrl: null, flatId: doc.id, flatImageUrl: data.image })
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
