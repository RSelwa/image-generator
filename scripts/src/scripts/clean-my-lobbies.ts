import { refs } from "@repo/providers/db-refs"
import { lobbyDocSchema } from "@repo/schemas"
import { z } from "zod"

const myId = "AjNM5ipvUogAZsn5RySHddC3k3F3"
// const lobbyStatusToDelete = LOBBY_STATUS.PLAYING

const myLobbies = await refs.lobbies.where("hostId", "==", myId).get()

const lobbiesToDelete = myLobbies.docs.filter((doc) => {
  const lobbyData = doc.data()
  const invalidLobby = lobbyDocSchema.safeParse(lobbyData)

  if (!invalidLobby.success) {
    console.info(`🗑️ incorrect lobby`, doc.id, z.treeifyError(invalidLobby.error).properties)

    return true
  }

  return false
})

for (const lobbyDoc of lobbiesToDelete) {
//   await refs.lobbies.doc(lobbyDoc.id).delete()
  console.info(`🗑️ lobby ${lobbyDoc.id} deleted`)
}

console.log(lobbiesToDelete.length)
