import { type LobbyDoc } from "@repo/schemas"
import { toast } from "sonner"
import { LobbyAvatars } from "@/components/lobby/avatars"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGES } from "@/constants/pages"
import { useSubscribeLobbyQuery, useUpdateLobbyConfigMutation } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type Props = {
  lobbyId: string
}

const LobbyWaiting = ({ lobbyId }: Props) => {
  const user = useAppSelector(selectUser)

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const [updateLobbyConfig, { isLoading: isLoadingUpdate }] = useUpdateLobbyConfigMutation()

  if (!lobby) return null

  const isOwner = lobby.hostId === user?.id

  const changeConfig = (newConfig: Partial<LobbyDoc["config"]>) => {
    if (!isOwner) {
      toast.error("Only the host can change the lobby config")

      return
    }

    updateLobbyConfig({
      lobbyId: lobby.id,
      config: newConfig
    })
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}${PAGES.JOIN_LOBBY}/${lobby.code}`)
    toast.success("Lobby url copied to clipboard")
  }

  return (
    <main className="min-h-full-height">
      <section>
        <h1 className="text-2xl font-bold mb-4">Join this lobby: {lobby.code}  </h1>
        <Button onClick={copyUrl}>Copy Lobby url</Button>
        <p className="text-lg text-muted-foreground">Players in lobby: {lobby.players.length}/{lobby.config.maxPlayers}</p>
        <p>Seed: {lobby.seedId}</p>
        <LobbyAvatars lobbyId={lobby.id} />
        <article className="p-8">
          <p>Config</p>
          <Select
            value={lobby.config.numberOfRounds.toString()}
            onValueChange={(value) => changeConfig({ numberOfRounds: Number.parseInt(value) })}
            disabled={isLoadingUpdate || !isOwner}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Number of rounds: ${lobby.config.numberOfRounds}`} />
            </SelectTrigger>
            <SelectContent>
              {[6, 12, 18, 24].map((roundNumber) => (
                <SelectItem key={roundNumber} value={roundNumber.toString()}>
                  {roundNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>Players lives: {lobby.config.playersLives}</div>
          <div>Round duration: {lobby.config.roundDuration}</div>
        </article>
      </section>

    </main>
  )
}

export default LobbyWaiting
