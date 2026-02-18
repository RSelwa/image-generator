import { METADATA_DOCS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type GameDoc, type GamesListDoc, type GamesListItem } from "@repo/schemas"
import { FieldValue } from "firebase-admin/firestore"
import { logger } from "firebase-functions"

const getMetadataRef = () => refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST)

export const updateGamesList = async (
  gameId: string,
  before: GameDoc | undefined,
  after: GameDoc | undefined,
) => {
  const isCreate = !before && after
  const isDelete = before && !after
  const isUpdate = before && after

  if (isDelete) {
    const metadataDoc = await getMetadataRef().get()
    const data = metadataDoc.data() as GamesListDoc | undefined
    const games = data?.games || []

    const updatedGames = games.filter((game) => game.id !== gameId)

    await getMetadataRef().set({ games: updatedGames })

    logger.info(`Removed game ${gameId} from gamesList metadata`)

    return
  }

  if (isCreate) {
    const newItem: GamesListItem = { id: gameId, title: after.title }

    const metadataDoc = await getMetadataRef().get()

    if (!metadataDoc.exists) {
      await getMetadataRef().set({ games: [newItem] })
    } else {
      await getMetadataRef().update({ games: FieldValue.arrayUnion(newItem) })
    }

    logger.info(`Added game ${gameId} to gamesList metadata`)

    return
  }

  if (isUpdate && before.title !== after.title) {
    const metadataDoc = await getMetadataRef().get()
    const data = metadataDoc.data() as GamesListDoc | undefined
    const games = data?.games || []

    const updatedGames = games.map((game) =>
      game.id === gameId ? { id: gameId, title: after.title } : game,
    )

    await getMetadataRef().set({ games: updatedGames })

    logger.info(`Updated game ${gameId} title in gamesList metadata`)

    return
  }
}
