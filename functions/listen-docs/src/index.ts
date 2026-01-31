import { TABLES } from "@repo/common"
import { type SphericalDoc } from "@repo/schemas"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"
import { updateGameStatus, updateSphericalStatus } from "~/updates-status"

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

// export const listen_doc_games_written = onDocumentWritten(
//   `${TABLES.GAMES}/{gameId}`,
//   async (event) => {
//     logger.log(`✍ Game ${event.document} written`)

//     const [, gameId] = event.document.split("/")

//     if (!gameId) {
//       logger.error(`Game ID is undefined in document path: ${event.document}`)
//       return
//     }
//   },
// )

// export const listen_doc_users_written = onDocumentWritten(
//   `${TABLES.USERS}/{userId}`,
//   async (event) => {
//     logger.log(`✍ Game ${event.document} written`)

//     const [, userId] = event.document.split("/")

//     if (!userId) {
//       logger.error(`User ID is undefined in document path: ${event.document}`)
//       return
//     }
//   },
// )
