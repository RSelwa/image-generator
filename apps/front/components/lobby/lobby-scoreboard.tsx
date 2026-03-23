import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "@/i18n/routing"
import { useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { firstLetter, getLobbyIdFromPathname } from "@/utils"
import { getAvatarUrl } from "@/utils/file"

const LobbyScoreboard = () => {
    const pathname = usePathname()
    const lobbyId = getLobbyIdFromPathname(pathname)

    const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
        skip: !lobbyId,
    })

    if (!lobby) return null

    const sortedPlayers = [...(lobby.players || [])].sort((a, b) => b.score - a.score)
    const allPlayersLength = sortedPlayers.length

    return (
        <div className="flex flex-col gap-2 w-full max-w-md">
            {sortedPlayers.map((player, index) => (
                <div
                    data-variant={index % 2 === 0 ? "primary" : "black"}
                    key={player.uid}
                    className="flex items-center gap-3 px-4 py-2 bg-background animate-in border border-primary slide-in-from-bottom fade-in font-mono"
                    style={{ animationDelay: `${(allPlayersLength - index) * 1000}ms`, animationFillMode: "both", animationDuration: "400ms" }}
                >
                    <span className="text-muted-foreground font-shapiro-wide font-bold w-6 text-center">#{index + 1}</span>
                    <Avatar size="sm">
                        <AvatarImage donorTier={player.donorTier} src={getAvatarUrl(player.avatar)} />
                        <AvatarFallback className="font-bold">{firstLetter(player.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium flex-1 truncate font-mono">{player.name}</span>
                    <span className="font-bold text-primary">{player.score}</span>
                </div>
            ))}
        </div>
    )
}

export default LobbyScoreboard
