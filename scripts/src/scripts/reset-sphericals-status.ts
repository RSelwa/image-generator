import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"

const allGames = await refs[TABLES.GAMES].get()

await Promise.all(
  allGames.docs.map(async () => {})
)
