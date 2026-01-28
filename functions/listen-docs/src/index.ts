import { DOCUMENTS_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"

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

    // Check if any spherical document in the subcollection has status READY
    const sphericalDocs = await refs[TABLES.GAMES]
      .doc(gameId)
      .collection(TABLES.SPHERICAL)
      .where("status", "==", DOCUMENTS_STATUS.READY)
      .limit(1)
      .get()

    const hasSphericalImagesReady = !sphericalDocs.empty

    const gameDoc = await refs[TABLES.GAMES].doc(gameId).get()

    // Only update if the value changed
    if (gameDoc.data()?.hasSphericalImagesReady === hasSphericalImagesReady)
      return

    await refs[TABLES.GAMES].doc(gameId).update({ hasSphericalImagesReady })
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
