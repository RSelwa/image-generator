import { type Player } from "@repo/schemas"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { useExcludePlayerMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter, getLobbyIdFromPathname } from "@/utils"

const AvatarPlayer = ({ p, isOwner}: { p: Player, isOwner?: boolean }) => (
  <Avatar>
    <AvatarImage src={p.avatar} />
    <AvatarFallback className="font-bold">{firstLetter(p.name)}</AvatarFallback>
    {isOwner && <AvatarBadge className="bg-amber-600 dark:bg-amber-800" />}
  </Avatar>
)

export const LobbyAvatars = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const user = useAppSelector(selectUser)

  const [excludeUser] = useExcludePlayerMutation()
  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  if (!lobby) return null

  const isOwner = lobby.hostId === user?.id

  if (!isOwner) {
    return (
      <AvatarGroup className="grayscale">
        {lobby.players.map((p) => (
          <AvatarPlayer key={p.uid} {...{ p }} />
        )
        )}
      </AvatarGroup>
    )
  }

  const handleExcludePlayer = async (playerId: string) => {
    await excludeUser({ lobbyId, playerId })
    toast.success("Player excluded")
  }

  return (
    <AvatarGroup>
      {lobby.players.map((p) => {
        const isPlayerOwner = lobby.hostId === p.uid

        return (
          <ContextMenu key={p.uid}>
            <ContextMenuTrigger>
              <AvatarPlayer p={p} isOwner={isPlayerOwner} />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem disabled={isPlayerOwner} onClick={() => handleExcludePlayer(p.uid)}>
                Exclude
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      }
      )}
    </AvatarGroup>
  )
}
