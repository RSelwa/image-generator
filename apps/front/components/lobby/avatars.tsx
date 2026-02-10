import { type Player } from "@repo/schemas"
import { Crown } from "lucide-react"
import { usePathname } from "next/navigation"
import { Fragment } from "react/jsx-runtime"
import { toast } from "sonner"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { useExcludePlayerMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter, getLobbyIdFromPathname } from "@/utils"

const AvatarPlayer = ({ p, isOwner}: { p: Player, isOwner?: boolean }) => (
  <Avatar>
    <AvatarImage src={p.avatar} />
    <AvatarFallback className="font-bold">{firstLetter(p.name)}</AvatarFallback>
    {isOwner && <Crown className="absolute fill-primary-foreground -top-4 left-1/2 -translate-x-1/2 stroke-0" size={16} />}
    {!p.isReady && <AvatarBadge className="bg-amber-600 dark:bg-amber-800" />}
    {p.isReady && <AvatarBadge className="bg-green-600 dark:bg-green-800" />}
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

  const handleExcludePlayer = async (playerId: string) => {
    await excludeUser({ lobbyId, playerId })
    toast.success("Player excluded")
  }

  return (
    <div className="flex gap-4 items-center justify-center">

      {Array.from({ length: lobby.config.maxPlayers }, (_, i) => {
        const player = lobby.players?.[i]

        if (!player) {
          return (
            <Avatar key={i} className="opacity-25">
              <AvatarFallback className="font-bold">?</AvatarFallback>
            </Avatar>
          )
        }

        const isPlayerOwner = lobby.hostId === player.uid

        return (
          <Fragment key={player.uid}>
            <ContextMenu>
              <ContextMenuTrigger disabled={!isOwner}>
                <AvatarPlayer p={player} isOwner={isPlayerOwner} />
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem disabled={isPlayerOwner} onClick={() => handleExcludePlayer(player.uid)}>
                  Exclude
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Fragment>
        )
      })}
    </div>
  )
}
