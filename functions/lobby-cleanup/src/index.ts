import { LOBBY_STATUS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type Timestamp } from "firebase-admin/firestore"
import { FieldValue } from "firebase-admin/firestore"
import { logger } from "firebase-functions"
import { onSchedule } from "firebase-functions/scheduler"
import { isAbandoned } from "~/is-abandoned"
import { shouldFinishInsteadOfAbandon } from "~/should-finish"

export const schedule_lobby_cleanup = onSchedule("every 30 minutes", async () => {
  logger.info("[lobby-cleanup] Starting lobby cleanup")

  const activeStatuses = [LOBBY_STATUS.WAITING, LOBBY_STATUS.STARTING, LOBBY_STATUS.PLAYING]

  const snapshots = await Promise.all(
    activeStatuses.map((status) =>
      refs[TABLES.LOBBIES].where("status", "==", status).get()
    )
  )

  const docs = snapshots.flatMap((snap) => snap.docs)

  if (docs.length === 0) {
    logger.info("[lobby-cleanup] No active lobbies found")

    return
  }

  logger.info(`[lobby-cleanup] Found ${docs.length} active lobbies to check`)

  let abandonedCount = 0
  let finishedCount = 0

  const abandonedDocs = docs
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

  await Promise.all(
    abandonedDocs.map(async (doc) => {
      const data = doc.data()
      const currentRound = data.currentRound || 0
      const numberOfRounds = data.config.numberOfRounds
      const playersCount = data.players?.length || 0

      const shouldFinish = await shouldFinishInsteadOfAbandon({
        lobbyId: doc.id,
        currentRound,
        numberOfRounds,
        playersCount,
        subRefs,
      })

      if (shouldFinish) {
        finishedCount++

        return doc.ref.update({
          status: LOBBY_STATUS.FINISHED,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }

      abandonedCount++

      return doc.ref.update({
        status: LOBBY_STATUS.ABANDONED,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  )

  logger.info(`[lobby-cleanup] Marked ${finishedCount} lobbies as finished, ${abandonedCount} lobbies as abandoned`)
})
