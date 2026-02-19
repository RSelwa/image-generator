import { zodResolver } from "@hookform/resolvers/zod"
import { OPTIONS_NUMBER_OF_ROUNDS, OPTIONS_PLAYERS_LIVES, OPTIONS_ROUND_DURATIONS } from "@repo/common"
import { type LobbyDoc } from "@repo/schemas"
import { ArrowRight, ArrowUpRightFromSquareIcon, Trash } from "lucide-react"
import { usePathname } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { LobbyAvatars } from "@/components/lobby/avatars"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription } from "@/components/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { PAGES } from "@/constants/pages"
import { useStartLobbyMutation, useSubscribeLobbyQuery, useUpdateLobbyConfigMutation, useUpdatePlayerReadyMutation } from "@/redux/api/lobby"
import { useApplySeedToLobbyMutation } from "@/redux/api/local"
import { selectIsLobbyHost } from "@/redux/lobby/lobby.selectors"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const seedForm = z.object({
  seed: z.string("Seed cannot be empty"),
})
type SeedForm = z.infer<typeof seedForm>

const LobbyWaiting = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const [updateLobbyConfig, { isLoading: isLoadingUpdate }] = useUpdateLobbyConfigMutation()
  const [startLobby] = useStartLobbyMutation()
  const [updatePlayerReady] = useUpdatePlayerReadyMutation()
  const [applySeed, { isLoading }] = useApplySeedToLobbyMutation()

  const userId = useAppSelector(selectUserId)
  const isOwner = useAppSelector(selectIsLobbyHost(lobbyId))

  const {
    handleSubmit,
    register,
    reset
  } = useForm<SeedForm>({
    resolver: zodResolver(seedForm),
    defaultValues: {
      seed: lobby?.seedId || "",
    },
  })

  if (!lobby) return null

  const disabled = !isOwner || isLoadingUpdate
  const hasLobbySeed = Boolean(lobby.seedId)
  const areAllPlayersReady = lobby.players.every((p) => p.isReady)
  const isMeReady = lobby.players.find((p) => p.uid === userId)?.isReady
  const isOnlyPlayer = lobby.players.length === 1

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

  const onSubmitSeed = async (data: SeedForm) => {
    try {
      if (isLoading || (!lobby.seedId && !data.seed)) return

      await applySeed({
        lobbyId: lobby.id,
        seedId: data.seed,
      }).unwrap()

      toast.success("Seed applied successfully")
    } catch (error) {
      console.error("Failed to apply seed:", error)
      toast.error("Failed to apply seed")
      reset()
    }
  }

  return (
    <main className="min-h-full-height w-3/4 mx-auto space-y-8">
      <section className="w-full flex flex-col border border-dashed items-center gap-4 p-6  text-muted-primary-foreground">
        <p className="text-lg ">Players in lobby: {lobby.players.length}/{lobby.config.maxPlayers}</p>
        <LobbyAvatars />
        <p>
          Ready:
          {" "}
          {lobby.players.filter((p) => p.isReady).length}
          /
          {lobby.players.length}
        </p>
      </section>
      <section className="grid grid-cols-2 gap-8">
        <article className="w-full flex flex-col border border-dashed items-center gap-4 p-6 ">
          <h2 className="mb-8">Config</h2>
          <div className="flex flex-col items-center gap-4">
            <Separator orientation="horizontal" />
            <Field orientation="horizontal" className="justify-between">
              <FieldDescription>
                Number of rounds:
              </FieldDescription>

              <Select
                value={lobby.config.numberOfRounds.toString()}
                onValueChange={(value) => changeConfig({ numberOfRounds: Number.parseInt(value) })}
                disabled={disabled || hasLobbySeed}
              >
                <SelectTrigger
                  data-testid="select-number-rounds-trigger"
                  className="w-20"
                >
                  <SelectValue
                    placeholder={`Number of rounds: ${lobby.config.numberOfRounds}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {OPTIONS_NUMBER_OF_ROUNDS.map((roundNumber) => (
                    <SelectItem
                      data-testid={`select-number-rounds-${roundNumber}-item`}

                      key={roundNumber}
                      value={roundNumber.toString()}
                    >
                      {roundNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </Field>
            <Separator orientation="horizontal" />

            <Field orientation="horizontal" className="justify-between">
              <FieldDescription>
                Players lives:
              </FieldDescription>
              <Select
                value={lobby.config.playersLives?.toString()}
                onValueChange={(value) => changeConfig({ playersLives: value !== "null" ? Number.parseInt(value) : null })}
                disabled={disabled}

              >
                <SelectTrigger
                  data-testid="select-player-live-trigger"
                  className="w-20"
                >
                  <SelectValue placeholder={`Players lives: ${lobby.config.playersLives || "Unlimited"}`} />
                </SelectTrigger>
                <SelectContent>
                  {OPTIONS_PLAYERS_LIVES.map((playerLive) => (
                    <SelectItem
                      data-testid={`select-player-live-${playerLive}-item`}
                      key={playerLive}
                      value={playerLive?.toString() || "null"}
                    >
                      {playerLive || "Unlimited"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Separator orientation="horizontal" />
            <Field orientation="horizontal" className="justify-between">
              <FieldDescription>
                Round duration:
              </FieldDescription>
              <Select
                value={lobby.config.roundDuration?.toString()}
                onValueChange={(value) => changeConfig({ roundDuration: Number.parseInt(value) })}
                disabled={disabled}
              >
                <SelectTrigger
                  data-testid="select-round-duration-trigger"
                  className="w-20"
                >
                  <SelectValue placeholder={`Rounds duration: ${lobby.config.roundDuration}`} />
                </SelectTrigger>
                <SelectContent>
                  {OPTIONS_ROUND_DURATIONS.map((roundDuration) => (
                    <SelectItem
                      data-testid={`select-round-duration-${roundDuration}-item`}
                      key={roundDuration}
                      value={roundDuration.toString()}
                    >
                      {roundDuration}s
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Separator orientation="horizontal" />

            <Field orientation="horizontal" className="justify-between">
              <Switch
                id="special-rounds"
                data-testid="special-rounds"
                checked={lobby.config.hasSpecialRounds}
                onCheckedChange={(checked) =>
                  changeConfig({ hasSpecialRounds: checked })}
                disabled={disabled || hasLobbySeed}
              />
              <FieldDescription>

                <Label htmlFor="special-rounds">Has special Rounds </Label>
              </FieldDescription>

            </Field>
          </div>
        </article>
        <article className="w-full flex flex-col border border-dashed items-center gap-4 p-6 ">
          <h2 className="mb-8">Seed</h2>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmitSeed)}>
            <InputGroup>
              <InputGroupInput
                placeholder="Paste seed here"
                data-testid="seed-input"
                disabled={isLoading || disabled}
                {...register("seed")}
                onPaste={(e) => {
                  if (e.clipboardData.getData("text")) setTimeout(() => handleSubmit(onSubmitSeed)(), 0)
                }}
              />
              <InputGroupAddon>
                {!hasLobbySeed && (
                  <InputGroupButton
                    data-testid="apply-seed-button"
                    type="submit"
                  >
                    <ArrowRight className="size-4" />
                  </InputGroupButton>
                )}

                {hasLobbySeed && (
                  <InputGroupButton
                    data-testid="clear-seed-button"
                    onClick={async () => applySeed({ lobbyId: lobby.id, seedId: "" })}
                  >
                    <Trash className="size-4" />
                  </InputGroupButton>
                )}
              </InputGroupAddon>
            </InputGroup>

          </form>
        </article>
      </section>

      <section className="w-full flex justify-center border border-dashed items-center gap-4 p-6 ">
        <Button variant="marathon-white" onClick={copyUrl}>
          Join this lobby: {lobby.code} <ArrowUpRightFromSquareIcon className="size-4" />
        </Button>

        {isOnlyPlayer && <Button
          data-testid="start-lobby-button-solo"
          onClick={async () => {
            updatePlayerReady({
              lobbyId,
              playerId: userId,
              isReady: !isMeReady
            })
            await startLobby({ lobbyId })
          }}>Play!</Button>}
        {!isOnlyPlayer &&
          <>
            <Button
              data-testid="ready-button"
              variant={isMeReady ? "marathon-outline" : "marathon"}
              onClick={() => updatePlayerReady({
                lobbyId,
                playerId: userId,
                isReady: !isMeReady
              })}
            >
              {isMeReady ? "Cancel ready" : "I'm ready"}
            </Button>
            <HoverCard>
              <HoverCardTrigger>
                <Button
                  data-testid="start-lobby-button"
                  variant={areAllPlayersReady ? "marathon" : "marathon-outline"}
                  disabled={disabled || !areAllPlayersReady}
                  onClick={async () => await startLobby({ lobbyId })}
                >
                  Start Lobby
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="text-foreground bg-primary/50 text-center">
                Only the host can start the lobby
              </HoverCardContent>

            </HoverCard>
          </>
        }
      </section>

    </main>
  )
}

export default LobbyWaiting
