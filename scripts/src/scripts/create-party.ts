import { DEFAULT_NUMBERS_ROUNDS } from "../../../libs/common/src/constants/constants.ts"
import { TABLES } from "../../../libs/common/src/constants/firebase.ts"
import { refs } from "../../../libs/providers/dist/db-refs.js"
import { sphericalDocWithIdSchema } from "../../../libs/schemas/src/firestore/spherical.ts"

export const createParty = async () => {
  const rounds = DEFAULT_NUMBERS_ROUNDS
  const selectedGames = await refs.games.limit(rounds).get()

  const levels = []

  await Promise.all(
    selectedGames.docs.map(async (doc) => {
      const game = { id: doc.id, ...doc.data() }

      const levelSnapshot = await refs.spherical
        .where("gameRef", "==", `/${TABLES.GAMES}/${game.id}`)
        .limit(1)
        .get()

      const level = sphericalDocWithIdSchema.safeParse({
        id: levelSnapshot.docs[0].id,
        ...levelSnapshot.docs[0].data(),
      })

      if (!level.success) return

      levels.push(level.data)
    }),
  )

  levels.filter((level) => level !== null)

  const game = {
    levels,
  }

  return game
}
