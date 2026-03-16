import { type Player } from "@repo/schemas"
import { Crown } from "lucide-react"
import { usePathname } from "@/i18n/routing"
import { Fragment } from "react/jsx-runtime"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { useExcludePlayerMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { firstLetter, getLobbyIdFromPathname } from "@/utils"
import { getAvatarUrl } from "@/utils/file"

const AvatarPlayer = ({ p, isOwner, isOnlyPlayer }: { p: Player, isOwner?: boolean, isOnlyPlayer?: boolean }) => (
  <Avatar>
    <AvatarImage style={{}} data-ready={p.isReady || isOnlyPlayer} className="data-[ready=true]:bg-ready  data-[ready=false]:bg-destructive" src={getAvatarUrl(p.avatar)} />
    <AvatarFallback className="font-bold">{firstLetter(p.name)}</AvatarFallback>
    {isOwner && <Crown className="absolute fill-primary -top-4 left-1/2 -translate-x-1/2 stroke-0" size={16} />}
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
  const isOnlyPlayer = lobby.players?.length === 1

  const handleExcludePlayer = async (playerId: string) => {
    await excludeUser({ lobbyId, playerId })
    toast.success("Player excluded")
  }

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 items-center justify-center">

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
                <AvatarPlayer p={player} isOwner={isPlayerOwner} isOnlyPlayer={isOnlyPlayer} />
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
