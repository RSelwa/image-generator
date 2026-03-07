import { LOBBY_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type Timestamp } from "firebase-admin/firestore"
import { FieldValue } from "firebase-admin/firestore"
import { logger } from "firebase-functions"
import { onSchedule } from "firebase-functions/scheduler"
import { isAbandoned } from "~/is-abandoned"

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

  const updates = docs
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
    .map((doc) => {
      abandonedCount++

      return doc.ref.update({
        status: LOBBY_STATUS.ABANDONED,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

  await Promise.all(updates)

  logger.info(`[lobby-cleanup] Marked ${abandonedCount} lobbies as abandoned`)
})
