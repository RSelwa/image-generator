import { METADATA_DOCS, TABLES } from "@repo/common"
import { type FlatDoc, type GameDoc, type SphericalDoc } from "@repo/schemas"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"
import { updateFlatStatus, updateGameStatus, updateSphericalStatus } from "~/updates-status"
import { updateGamesList } from "~/updates-games-list"

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
