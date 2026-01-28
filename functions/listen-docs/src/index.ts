import { DOCUMENTS_STATUS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import type { SphericalDoc } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"

export const listen_doc_spherical_written = onDocumentWritten(
  `${TABLES.GAMES}/{gameId}/${TABLES.SPHERICAL}/{sphericalId}`,
  async (event) => {
    logger.log(`✍ Spherical ${event.document} written`)

    const [, gameId, _, sphericalId] = event.document.split("/")
    const afterData = event.data?.after.data() as SphericalDoc | undefined

    if (!sphericalId || !gameId) {
      logger.error(
        `Spherical ID is undefined in document path: ${event.document}`,
      )
      return
    }

    await subRefs[TABLES.SPHERICAL](gameId).doc(sphericalId).update({
      updatedAt: Timestamp.now(),
    })

    if (afterData?.status !== DOCUMENTS_STATUS.READY) return

    const gameDoc = await refs[TABLES.GAMES].doc(gameId).get()

    if (gameDoc.data()?.hasSphericalImagesReady) return

    await refs[TABLES.GAMES]
      .doc(gameId)
      .update({ hasSphericalImagesReady: true })
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
