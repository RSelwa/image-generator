import { DOCUMENTS_STATUS, TABLES } from "@repo/common"
import { subRefs } from "@repo/providers/db-refs"

// const allSphericals = await collectionGroupRefs[TABLES.SPHERICAL].get()

// await Promise.all(
//   allSphericals.docs.map(async (sphericalDoc) => {
//     await sphericalDoc.ref.update({
//       difficulty: DIFFICULTIES.EASY
//     })
//   })
// )

const gameId = "101680"
const sphericalId = "1DjpNvVfyOVNepcAmRzT"

const snapshot = await subRefs[TABLES.SPHERICAL](gameId).doc(sphericalId).get()

const data = snapshot.data()

if (data) {
  const currentStatus = data.status || DOCUMENTS_STATUS.WAITING

  const isReady = Boolean(data.image) && data?.mapId && data?.mapPosition?.x !== undefined && data?.mapPosition?.y !== undefined

  const dontChanges = currentStatus === DOCUMENTS_STATUS.READY || currentStatus === DOCUMENTS_STATUS.NEED_VERIFICATION || !isReady

  console.log(dontChanges)

  if (!dontChanges)
    await subRefs[TABLES.SPHERICAL](gameId).doc(sphericalId).update({ difficulty: "easy" })
}
