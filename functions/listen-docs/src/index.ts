import { AUDIO_EXTRACT_ENDPOINT, extractYoutubeId, SOUND_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type DailyChallengeDoc, type FlatDoc, type GameDoc, type SoundDoc, type SphericalDoc } from "@repo/schemas"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"
import { updateDailyChallengesMetadata } from "~/update-daily-challenges-metadata"
import { updateGamesList } from "~/updates-games-list"
import { updateFlatStatus, updateGameStatus, updateSphericalStatus } from "~/updates-status"

export const listen_doc_spherical_written = onDocumentWritten(
  `${TABLES.GAMES}/{gameId}/${TABLES.SPHERICAL}/{sphericalId}`,
  async (event) => {
    logger.log(`✍ Spherical ${event.document} written`)

    const [, gameId, _, sphericalId] = event.document.split("/")

    if (!sphericalId || !gameId) {
      logger.error(
        `Spherical ID is undefined in document path: ${event.document}`,
      )

      return
    }

    const data = event.data?.after.data() as SphericalDoc | undefined

    await Promise.all([
      updateGameStatus(gameId),
      updateSphericalStatus(gameId, sphericalId, data),
    ])
  },
)

export const listen_doc_flat_written = onDocumentWritten(
  `${TABLES.GAMES}/{gameId}/${TABLES.FLAT}/{flatId}`,
  async (event) => {
    logger.log(`✍ Spherical ${event.document} written`)

    const [, gameId, _, flatId] = event.document.split("/")

    if (!flatId || !gameId) {
      logger.error(
        `Spherical ID is undefined in document path: ${event.document}`,
      )

      return
    }

    const data = event.data?.after.data() as FlatDoc | undefined

    await updateFlatStatus(gameId, flatId, data)
  },
)

export const listen_doc_games_written = onDocumentWritten(
  `${TABLES.GAMES}/{gameId}`,
  async (event) => {
    try {
      const gameId = event.params.gameId

      if (!gameId) {
        logger.error(`Game ID is undefined in document path: ${event.document}`)

        return
      }

      const before = event.data?.before.data() as GameDoc | undefined
      const after = event.data?.after.data() as GameDoc | undefined

      await updateGamesList(gameId, before, after)
    } catch (error) {
      console.error(`Error in listen_doc_games_written for document ${event.document}:`, error)
    }
  },
)

export const listen_sounds_written = onDocumentWritten(
  { document: `${TABLES.SOUNDS}/{soundId}`, timeoutSeconds: 120 },
  async (event) => {
    try {
      const soundId = event.params.soundId

      if (!soundId) {
        logger.error(`Sound ID is undefined in document path: ${event.document}`)

        return
      }

      const before = event.data?.before.data() as SoundDoc | undefined
      const after = event.data?.after.data() as SoundDoc | undefined

      if (!after) {
        logger.info(`Sound ${soundId} was deleted, skipping`)

        return
      }

      const hasYoutubeLinkChanged = before?.youtubeLink !== after?.youtubeLink
      const isWaitingForExtraction = after.status === SOUND_STATUS.WAITING_FOR_EXTRACTION

      if (hasYoutubeLinkChanged || isWaitingForExtraction) {
        if (!after.youtubeLink) {
          logger.warn(`Sound ${soundId} triggered extraction but has no youtubeLink, skipping`)

          return
        }

        const youtubeId = extractYoutubeId(after.youtubeLink)

        if (youtubeId) {
          const existingSoundsSnapshot = await refs[TABLES.SOUNDS].where("youtubeId", "==", youtubeId).limit(2).get()
          const existingSound = existingSoundsSnapshot.docs.find((doc) => doc.id !== soundId)
          const existingSoundData = existingSound?.data()

          if (existingSoundData?.storagePath) {
            logger.info(`Sound ${soundId} is a duplicate of ${existingSound!.id} (youtubeId ${youtubeId}), deleting duplicate`)

            await refs[TABLES.SOUNDS].doc(soundId).delete()

            return
          }

          if (!after.youtubeId) {
            logger.info(`Sound ${soundId} — pre-populating youtubeId ${youtubeId} so the extraction script can find this doc`)

            await refs[TABLES.SOUNDS].doc(soundId).update({
              youtubeId,
              status: SOUND_STATUS.PENDING,
            })
          }
        }

        logger.info(`Sound ${soundId} has changed and is waiting for extraction, triggering audio extraction`)

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 90_000)

        const res = await fetch(AUDIO_EXTRACT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            youtubeLink: after.youtubeLink,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!res.ok) {
          const errorText = await res.text()
          logger.error(`Audio extraction failed for sound ${soundId} with status ${res.status}: ${errorText}`)
        }
      }
    } catch (error) {
      console.error(`Error in listen_doc_games_written for document ${event.document}:`, error)
    }
  },
)

export const listen_daily_challenges_written = onDocumentWritten(
  `${TABLES.DAILY_CHALLENGES}/{date}`,
  async (event) => {
    try {
      const date = event.params.date

      if (!date) {
        logger.error(`daily challenge is undefined in document path: ${event.document}`)

        return
      }

      const before = event.data?.before.data() as DailyChallengeDoc | undefined
      const after = event.data?.after.data() as DailyChallengeDoc | undefined

      await updateDailyChallengesMetadata(date, before, after)
    } catch (error) {
      console.error(`Error in listen_doc_games_written for document ${event.document}:`, error)
    }
  },
)
