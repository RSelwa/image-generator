import { AUDIO_EXTRACT_ENDPOINT, SOUND_STATUS, TABLES } from "@repo/common"
import { type FlatDoc, type GameDoc, type SoundDoc, type SphericalDoc } from "@repo/schemas"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"
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
  `${TABLES.SOUNDS}/{soundId}`,
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
        logger.info(`Sound ${soundId} has changed and is waiting for extraction, triggering audio extraction`)

        await fetch(AUDIO_EXTRACT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            youtubeLink: after.youtubeLink,
          }),
        })
      }
    } catch (error) {
      console.error(`Error in listen_doc_games_written for document ${event.document}:`, error)
    }
  },
)
