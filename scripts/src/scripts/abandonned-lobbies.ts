import { LOBBY_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { FieldValue, type Timestamp } from "firebase-admin/firestore"

const activeStatuses = [LOBBY_STATUS.WAITING, LOBBY_STATUS.STARTING, LOBBY_STATUS.PLAYING]

const ONE_HOUR_MS = 60 * 60 * 1000
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000
const EARLY_ROUND_THRESHOLD = 3

export const isAbandoned = (createdAt: Timestamp, currentRound: number, config: { numberOfRounds: number, roundDuration: number }): boolean => {
  const now = Date.now()
  const createdAtMs = createdAt.toMillis()
  const elapsedMs = now - createdAtMs

  // If more than 1 hour has passed, check if the game could still be running
  if (elapsedMs > ONE_HOUR_MS) {
    const maxPossibleDurationMs = config.numberOfRounds * config.roundDuration * 1000
    // If max possible duration exceeds 1 hour (e.g. 24 rounds * 120s = 48min, but with delays could be longer),
    // only abandon if elapsed time exceeds the max possible duration + buffer
    if (maxPossibleDurationMs > ONE_HOUR_MS) {
      return elapsedMs > maxPossibleDurationMs + FIFTEEN_MINUTES_MS
    }

    return true
  }

  // If 15 minutes have passed and still in early rounds (1-2), it's abandoned
  if (elapsedMs > FIFTEEN_MINUTES_MS && currentRound < EARLY_ROUND_THRESHOLD) {
    return true
  }

  return false
}

const allLobbies = await refs[TABLES.LOBBIES].count().get()

const snapshots = await Promise.all(
  activeStatuses.map((status) =>
    refs[TABLES.LOBBIES].where("status", "==", status).get()
  )
)

const docs = snapshots.flatMap((snap) => snap.docs)

if (docs.length === 0) {
  console.info("[lobby-cleanup] No active lobbies found")

  throw new Error("No active lobbies found")
}

console.info(`[lobby-cleanup] Found ${docs.length} active lobbies to check`)

let abandonedCount = 0

const docsToUpdate = docs
  .filter((doc) => {
    const data = doc.data()

    if (!data.createdAt || !data.config) return false

    return isAbandoned(
      data.createdAt as Timestamp,
      data.currentRound || 0,
      {
        numberOfRounds: data.config.numberOfRounds,
        roundDuration: data.config.roundDuration,
      },
    )
  })

console.table(docsToUpdate.map((doc) => ({
  id: doc.id,
})))

const updates = docsToUpdate
  .map((doc) => {
    abandonedCount++

    return doc.ref.update({
      status: LOBBY_STATUS.ABANDONED,
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

await Promise.all(updates)

console.info(`[lobby-cleanup] Marked ${abandonedCount} lobbies as abandoned`)

const allLobiesLength = allLobbies.data()?.count || 0

console.log(docs.length)
console.log(allLobiesLength)

console.log(docs.length * 100 / allLobiesLength)
