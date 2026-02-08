import { OPTIONS_NUMBER_OF_ROUNDS, OPTIONS_PLAYERS_LIVES, OPTIONS_ROUND_DURATIONS } from "@repo/common"
import { type LobbyDoc } from "@repo/schemas"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { LobbyAvatars } from "@/components/lobby/avatars"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PAGES } from "@/constants/pages"
import { useStartLobbyMutation, useSubscribeLobbyQuery, useUpdateLobbyConfigMutation } from "@/redux/api/lobby"
import { selectIsLobbyHost } from "@/redux/lobby/lobby.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const LobbyWaiting = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const [updateLobbyConfig, { isLoading: isLoadingUpdate }] = useUpdateLobbyConfigMutation()
  const [startLobby] = useStartLobbyMutation()

  const isOwner = useAppSelector(selectIsLobbyHost(lobbyId))

  if (!lobby) return null

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
        <LobbyAvatars />
        <article className="p-8">
          <p>Config</p>
          <div>
            Number of rounds:
            <Select
              value={lobby.config.numberOfRounds.toString()}
              onValueChange={(value) => changeConfig({ numberOfRounds: Number.parseInt(value) })}
              disabled={isLoadingUpdate || !isOwner}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Number of rounds: ${lobby.config.numberOfRounds}`} />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS_NUMBER_OF_ROUNDS.map((roundNumber) => (
                  <SelectItem key={roundNumber} value={roundNumber.toString()}>
                    {roundNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            Players lives:
            <Select
              value={lobby.config.playersLives?.toString()}
              onValueChange={(value) => changeConfig({ playersLives: value !== "null" ? Number.parseInt(value) : null })}
              disabled={isLoadingUpdate || !isOwner}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Players lives: ${lobby.config.playersLives || "Unlimited"}`} />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS_PLAYERS_LIVES.map((roundNumber) => (
                  <SelectItem key={roundNumber} value={roundNumber?.toString() || "null"}>
                    {roundNumber || "Unlimited"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            Round duration:
            <Select
              value={lobby.config.roundDuration?.toString()}
              onValueChange={(value) => changeConfig({ roundDuration: Number.parseInt(value) })}
              disabled={isLoadingUpdate || !isOwner}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Rounds duration: ${lobby.config.roundDuration}`} />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS_ROUND_DURATIONS.map((roundDuration) => (
                  <SelectItem key={roundDuration} value={roundDuration.toString()}>
                    {roundDuration}s
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Switch
              id="special-rounds"
              checked={lobby.config.hasSpecialRounds}
              onCheckedChange={(checked) =>

                changeConfig({ hasSpecialRounds: checked })}
            />
            <Label htmlFor="special-rounds">Has special Rounds </Label>

          </div>
        </article>
        <Button
          variant="secondary"
          onClick={() => startLobby({ lobbyId })}
        >
          Start Lobby
        </Button>
      </section>
    </main>
  )
}

export default LobbyWaiting
