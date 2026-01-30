import { subRefs } from "@repo/providers/db-refs"
import { TABLES } from "../../../libs/common/src/constants/firebase.ts"
import { gameId, sphericalIdsToSave } from "../constants/index.ts"
import { getFlag } from "../constants/utils.ts"

const isDelete = getFlag("delete", "false") === "true"

const snapshot = await subRefs[TABLES.SPHERICAL](gameId).get()

const docsToDelete = snapshot.docs
  .filter((doc) => !sphericalIdsToSave.includes(doc.id))
  .map((doc) => doc.id)

const isCorrectNumberOfSave = snapshot.docs.length - docsToDelete.length
const isDeleteAllDocs = isCorrectNumberOfSave === 0

console.info(`gonna delete ${docsToDelete.length} docs`)

if (!isDelete) {
  console.info(
    "Dry run mode. No documents will be deleted. Use --delete=true to actually delete.",
  )
  Deno.exit(0)
}

if (isDeleteAllDocs || isCorrectNumberOfSave !== sphericalIdsToSave.length) {
  console.info("You are trying to delete all documents. Operation aborted.")
  Deno.exit(1)
}

await Promise.all(
  docsToDelete.map(async (id) => {
    try {
      if (isDelete) {
        await subRefs[TABLES.SPHERICAL](gameId).doc(id).delete()

        console.info(`Deleted spherical with id ${id}`)
      }
    } catch (error) {
      console.error(`Error deleting spherical with id ${id}:`, error)
    }
  }),
)
