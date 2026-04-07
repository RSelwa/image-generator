import { zodResolver } from "@hookform/resolvers/zod"
import { LOBBY_MODES, OPTIONS_NUMBER_OF_ROUNDS, OPTIONS_PLAYERS_LIVES, OPTIONS_ROUND_DURATIONS } from "@repo/common"
import { type LobbyDoc } from "@repo/schemas"
import { type DriveStep } from "driver.js"
import { driver } from "driver.js"
import { ArrowRight, ArrowUpRightFromSquareIcon, Trash } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { LobbyAvatars } from "@/components/lobby/avatars"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription } from "@/components/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { DRIVER_IDS, STEPS } from "@/constants/driver"
import { ASSET_URLS, FALL_BACK_IMAGE, STORAGE_KEYS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useLocalStorage } from "@/hooks/use-storage"
import { usePathname } from "@/i18n/routing"
import { useStartLobbyMutation, useSubscribeLobbyQuery, useUpdateLobbyConfigMutation, useUpdatePlayerReadyMutation } from "@/redux/api/lobby"
import { useApplySeedToLobbyMutation } from "@/redux/api/local"
import { useGetFeaturedSeedsQuery } from "@/redux/api/seed"
import { selectIsLobbyHost } from "@/redux/lobby/lobby.selectors"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"
import "driver.js/dist/driver.css"

const seedForm = z.object({
  seed: z.string("Seed cannot be empty"),
})
type SeedForm = z.infer<typeof seedForm>

const LobbyWaiting = () => {
  const t = useTranslations("lobby")
  const locale = useLocale()
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [isSkipDriver, setIsSkipDriver] = useLocalStorage(STORAGE_KEYS.DRIVER_WAITING_ROOM, false)

  const { data: featuredSeeds } = useGetFeaturedSeedsQuery()
  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const [updateLobbyConfig, { isLoading: isLoadingUpdate }] = useUpdateLobbyConfigMutation()
  const [startLobby] = useStartLobbyMutation()
  const [updatePlayerReady] = useUpdatePlayerReadyMutation()
  const [applySeed, { isLoading }] = useApplySeedToLobbyMutation()

  const userId = useAppSelector(selectUserId)
  const isOwner = useAppSelector(selectIsLobbyHost(lobbyId))
  const isOnlyPlayer = lobby?.players.length === 1

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

  useEffect(() => {
    reset({ seed: lobby?.seedId || "" })
  }, [lobby?.seedId])

  const initDriver = () => {
    if (isSkipDriver) return

    const steps: DriveStep[] = [
      STEPS.LOBBY_PLAYERS,
    ]

    if (isOwner) {
      steps.push(STEPS.LOBBY_CONFIG, STEPS.LOBBY_SEED, STEPS.JOIN_LOBBY_LINK)

      if (isOnlyPlayer)
        steps.push(STEPS.START_BUTTON_SOLO)
      else
        steps.push(STEPS.READY_BUTTON, STEPS.START_BUTTON)
    } else
      steps.push(STEPS.READY_BUTTON)

    const driverObj = driver({
      showProgress: true,
      steps,
      allowKeyboardControl: true,
      onDestroyed: () => setIsSkipDriver(true)
    })

    driverObj.drive()
  }

  useEffect(() => {
    if (!lobby) return
    initDriver()
  }, [])

  if (!lobby) return null

  const disabled = !isOwner || isLoadingUpdate
  const hasLobbySeed = Boolean(lobby.seedId)
  const isMapOnly = lobby.config.mode === LOBBY_MODES.MAP_ONLY
  const areAllPlayersReady = lobby.players.every((p) => p.isReady)
  const isMeReady = lobby.players.find((p) => p.uid === userId)?.isReady

  const changeConfig = (newConfig: Partial<LobbyDoc["config"]>) => {
    if (!isOwner) {
      toast.error(t("onlyHostCanChange"))

      return
    }

    if (newConfig.mode === LOBBY_MODES.MAP_ONLY) {
      newConfig.hasSpecialRounds = false
    }

    updateLobbyConfig({
      lobbyId: lobby.id,
      config: newConfig
    })
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${locale}${PAGES.JOIN_LOBBY}/${lobby.code}`)
    toast.success(t("lobbyUrlCopied"))
  }

  const onSubmitSeed = async (data: SeedForm) => {
    try {
      if (isLoading || (!lobby.seedId && !data.seed)) return

      await applySeed({
        lobbyId: lobby.id,
        seedId: data.seed,
      }).unwrap()

      toast.success(t("seedApplied"))
    } catch (error) {
      console.error("Failed to apply seed:", error)
      toast.error(t("seedFailed"))
      reset()
    }
  }

  return (
    <main className="min-h-full-height flex items-center justify-center relative bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute bottom-0 right-0 z-0" />
      <div className="bg-background/80 space-y-8 lg:w-3/4 w-5/6 z-10 lg:my-0 my-4">
        <section id={DRIVER_IDS.LOBBY_PLAYERS} className="w-full flex flex-col border border-dashed items-center gap-4 p-6  text-muted-primary-foreground">
          <p className="text-lg ">{t("playersInLobby", { count: lobby.players.length, max: lobby.config.maxPlayers })}</p>
          <LobbyAvatars />
          {!isOnlyPlayer && (
            <p>
              {t("readyCount", { count: lobby.players.filter((p) => p.isReady).length, total: lobby.players.length })}
            </p>
          )}
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <article id={DRIVER_IDS.LOBBY_CONFIG} className="w-full flex flex-col border border-dashed items-center justify-between p-6">
            <h2 className="mb-8">{t("config")}</h2>
            <div className="flex flex-col items-center gap-4">
              <Separator orientation="horizontal" />
              <Field orientation="horizontal" className="justify-between">
                <FieldDescription>
                  {t("numberOfRounds")}
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
                      placeholder={`${t("numberOfRounds")} ${lobby.config.numberOfRounds}`}
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
                  {t("playersLives")}
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
                    <SelectValue placeholder={`${t("playersLives")} ${lobby.config.playersLives || t("unlimited")}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTIONS_PLAYERS_LIVES.map((playerLive) => (
                      <SelectItem
                        data-testid={`select-player-live-${playerLive}-item`}
                        key={playerLive}
                        value={playerLive?.toString() || "null"}
                      >
                        {playerLive || t("unlimited")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Separator orientation="horizontal" />
              <Field orientation="horizontal" className="justify-between">
                <FieldDescription>
                  {t("roundDuration")}
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
                    <SelectValue placeholder={`${t("roundDuration")} ${lobby.config.roundDuration}`} />
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
                <FieldDescription>
                  {t("gameMode")}
                </FieldDescription>
                <Select
                  value={lobby.config.mode}
                  onValueChange={(value) => changeConfig({ mode: value as LobbyDoc["config"]["mode"] })}
                  disabled={disabled}
                >
                  <SelectTrigger
                    data-testid="select-game-mode-trigger"
                    className="w-32"
                  >
                    <SelectValue placeholder={t("gameMode")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem data-testid="select-game-mode-full-item" value={LOBBY_MODES.FULL}>{t("modeFull")}</SelectItem>
                    <SelectItem data-testid="select-game-mode-game-only-item" value={LOBBY_MODES.GAME_ONLY}>{t("modeGameOnly")}</SelectItem>
                    <SelectItem data-testid="select-game-mode-map-only-item" value={LOBBY_MODES.MAP_ONLY}>{t("modeMapOnly")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Separator orientation="horizontal" />
              <Field id={DRIVER_IDS.LOBBY_SPECIAL_ROUNDS} orientation="horizontal" className="justify-between">
                <FieldDescription>
                  <Label htmlFor="special-rounds">{t("enableSpecialRounds")} </Label>
                </FieldDescription>
                <Switch
                  id="special-rounds"
                  data-testid="special-rounds"
                  checked={isMapOnly ? false : lobby.config.hasSpecialRounds}
                  onCheckedChange={(checked) =>
                    changeConfig({ hasSpecialRounds: checked })}
                  disabled={disabled || hasLobbySeed || isMapOnly}
                />
              </Field>
            </div>
          </article>
          <article className="w-full flex flex-col border border-dashed items-center gap-4 p-6 ">
            <div className="flex items-center gap-8">
              <h2>{t("seed")}</h2>
              <form autoComplete="off" onSubmit={handleSubmit(onSubmitSeed)}>
                <InputGroup id={DRIVER_IDS.LOBBY_SEED}>
                  <InputGroupInput
                    placeholder={t("pasteSeedHere")}
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
            </div>

            <ScrollArea className="h-64 relative w-full">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
                {featuredSeeds?.map((seed) => (
                  <button disabled={isLoading || disabled} key={seed.id} className="cursor-pointer hover:bg-primary/50 relative" onClick={() => applySeed({ lobbyId: lobby.id, seedId: seed.id })}>
                    <Image src={seed.rounds[0]?.gameThumbnailUrl || FALL_BACK_IMAGE} alt={seed.name} width={100} height={100} className="object-cover object-center size-full max-h-28" />
                    <p className="bg-background text-primary font-mono absolute bottom-0 left-0 w-full">{seed.name}</p>
                  </button>
                ))}
              </div>
              <span className="absolute bottom-0 left-0 w-full h-14 bg-linear-to-b from-transparent to-background/80" />
            </ScrollArea>
          </article>
        </section>
        <section className="w-full flex flex-col lg:flex-row justify-center border border-dashed items-center gap-4 p-6 ">
          <Button id={DRIVER_IDS.JOIN_LOBBY_LINK} variant="marathon-white" onClick={copyUrl}>
            {t("joinThisLobby", { code: lobby.code })} <ArrowUpRightFromSquareIcon className="size-4" />
          </Button>

          {isOnlyPlayer && (
            <Button
              id={DRIVER_IDS.START_BUTTON_SOLO}
              data-testid="start-lobby-button-solo"
              onClick={async () => {
                updatePlayerReady({
                  lobbyId,
                  playerId: userId,
                  isReady: !isMeReady
                })
                await startLobby({ lobbyId })
              }}
              className="w-full lg:w-auto"
            >
              {t("playButton")}
            </Button>
          )}
          {!isOnlyPlayer && (
            <>
              <Button
                id={DRIVER_IDS.READY_BUTTON}
                data-testid="ready-button"
                variant={isMeReady ? "marathon-outline" : "marathon"}
                onClick={() => updatePlayerReady({
                  lobbyId,
                  playerId: userId,
                  isReady: !isMeReady
                })}
              >
                {isMeReady ? t("cancelReady") : t("imReady")}
              </Button>
              <HoverCard>
                <HoverCardTrigger>
                  <Button
                    id={DRIVER_IDS.START_BUTTON}
                    data-testid="start-lobby-button"
                    variant={areAllPlayersReady ? "marathon" : "marathon-outline"}
                    disabled={disabled || !areAllPlayersReady}
                    onClick={async () => await startLobby({ lobbyId })}
                  >
                    {t("startLobby")}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="text-foreground bg-primary/50 text-center">
                  {t("onlyHostCanStart")}
                </HoverCardContent>
              </HoverCard>
            </>
          )}
        </section>
      </div>

    </main>
  )
}

export default LobbyWaiting
