import { DOCUMENTS_STATUS } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"

// const allSphericals = await collectionGroupRefs[TABLES.SPHERICAL].get()
const allGames = await refs.games.get()
// const allUsers = await refs.users.get()

const batch = db.batch()

const lengt = []

for (const doc of allGames.docs) {
  const gameId = doc.id
  const allSphericals = await subRefs.spherical(gameId).get()

  allSphericals.docs.forEach((sphericalDoc) => {
    batch.update(subRefs.spherical(gameId).doc(sphericalDoc.id), {
      status: DOCUMENTS_STATUS.NEED_VERIFICATION,
    })
    lengt.push(sphericalDoc.id)
  })
}

console.log(lengt.length)
await batch.commit()
