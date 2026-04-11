"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DEATH_RUN_MAX_REVIVES } from "@repo/common"
import { type DeathRunDocWithId, type DeathRunRunDocWithId, type MarathonSeedDocWithId } from "@repo/schemas"
import { Heart, HeartOff, MonitorPlay } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import useSound from "use-sound"
import z from "zod"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { SOUNDS } from "@/constants/sound"
import { SELECTORS } from "@/constants/testing"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRewardedAd } from "@/hooks/use-rewarded-ad"
import { useFinishDeathRunRunMutation, useReviveDeathRunRunMutation, useSubmitDeathRunAnswerMutation } from "@/redux/api/death-run"
import { useGetAllGamesNamesQuery } from "@/redux/api/games"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const schema = z.object({
  input: z.string().min(1),
})

type Schema = z.infer<typeof schema>

const DeathRunPlaying = ({
  deathRun,
  run,
  seed,
}: {
  deathRun: DeathRunDocWithId
  run: DeathRunRunDocWithId
  seed: MarathonSeedDocWithId
}) => {
  const uid = useAppSelector(selectUserId)
  const isMobile = useIsMobile()
  const { showAd } = useRewardedAd()

  const { data: allGames } = useGetAllGamesNamesQuery()
  const [submitAnswer] = useSubmitDeathRunAnswerMutation()
  const [finishRun] = useFinishDeathRunRunMutation()
  const [revive] = useReviveDeathRunRunMutation()

  const [comboboxKey, setComboboxKey] = useState(0)
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [playCorrect] = useSound(SOUNDS.CORRECT_GAME, { volume: 0.5 })
  const [playWrong] = useSound(SOUNDS.WRONG, { volume: 0.5 })
  const hasFinished = useRef(false)

  const isOutOfLives = run.livesRemaining <= 0
  const canRevive = run.revivesUsed < DEATH_RUN_MAX_REVIVES

  const { register, watch, reset } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { input: "" },
  })

  const currentRound = seed.rounds[run.currentRoundIndex]
  const isSpherical = Boolean(currentRound?.sphericalImageUrl)
  const imageUrl = currentRound?.sphericalImageUrl || currentRound?.flatImageUrl || ""
  const gameId = currentRound?.gameId || ""
  const input = watch("input")

  const filteredGames = allGames?.filter(({ title }) =>
    title.toLowerCase().includes(input.toLowerCase().trim())
  ) || []

  const handleGuess = async (gameTitle: string, guessedGameId: string) => {
    if (!deathRun.seedId || isOutOfLives || hasFinished.current) return

    const isCorrect = guessedGameId === gameId
    if (isCorrect)
      playCorrect()
    else
      playWrong()

    await submitAnswer({
      deathRunId: deathRun.id,
      uid,
      roundIndex: run.currentRoundIndex,
      gameId,
      seedId: deathRun.seedId,
      currentRoundIndex: run.currentRoundIndex,
      currentScore: run.score,
      currentLives: run.livesRemaining,
      seedRoundsCount: seed.rounds.length,
      answer: gameTitle,
      isCorrect,
    })

    reset()
    setComboboxKey((k) => k + 1)
  }

  const handleGiveUp = () => {
    if (hasFinished.current) return
    hasFinished.current = true
    finishRun({ deathRunId: deathRun.id, uid })
      .catch(() => console.error("Failed to finish death run"))
  }

  const handleWatchAd = () => {
    setIsWatchingAd(true)
    showAd({
      name: "death-run-revive",
      onRewarded: () => {
        revive({ deathRunId: deathRun.id, uid })
          .catch(() => console.error("Failed to revive"))
        setIsWatchingAd(false)
      },
      onDismissed: () => {
        setIsWatchingAd(false)
      },
    })
  }

  useEffect(() => {
    if (!isOutOfLives || !uid || hasFinished.current || canRevive) return
    hasFinished.current = true
    finishRun({ deathRunId: deathRun.id, uid })
      .catch(() => console.error("Failed to finish death run on lives empty"))
  }, [isOutOfLives, canRevive])

  return (
    <div className="h-full-height flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/80 backdrop-blur">
        <span className="text-sm text-muted-foreground">
          Round
          {" "}
          <span data-testid={SELECTORS.DEATH_RUN_ROUND_INDEX} className="font-mono font-bold text-foreground">
            {run.currentRoundIndex + 1}
          </span>
        </span>

        <div data-testid={SELECTORS.DEATH_RUN_LIVES} className="flex items-center gap-1">
          {Array.from({ length: deathRun.lives }).map((_, i) => (
            i < run.livesRemaining ? <Heart key={i} className="size-5 fill-primary text-primary" /> : <HeartOff key={i} className="size-5 text-muted-foreground" />
          ))}
        </div>

        <span data-testid={SELECTORS.DEATH_RUN_SCORE} className="font-mono font-bold text-primary">
          {run.score} pts
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {imageUrl && isSpherical && <ReactSphere src={imageUrl} />}
        {imageUrl && !isSpherical && (
          <Image src={imageUrl} alt="Guess the game" fill className="object-cover" priority />
        )}

        {isOutOfLives && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur gap-4">
            <HeartOff className="size-12 text-destructive" />
            <p className="text-2xl font-bold">Game Over</p>
            <p className="text-muted-foreground text-sm">{run.score} pts — {run.answers.filter((a) => a.isCorrect).length} correct</p>

            {canRevive && !isWatchingAd && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <Button onClick={handleWatchAd} className="gap-2">
                  <MonitorPlay className="size-4" />
                  Watch an ad to get 1 life back
                </Button>
                <Button variant="ghost" size="sm" onClick={handleGiveUp}>
                  Give up
                </Button>
              </div>
            )}

            {isWatchingAd && (
              <p className="text-sm text-muted-foreground animate-pulse">Loading ad…</p>
            )}
          </div>
        )}

        {!isOutOfLives && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-6">
            <Combobox key={comboboxKey}>
              <ComboboxInput
                showTrigger={false}
                type="text"
                placeholder="Guess the game…"
                autoFocus={!isMobile}
                className="dark:bg-background/60 font-mono! text-xl font-bold placeholder:text-foreground/70 w-96 py-5"
                data-testid={SELECTORS.DEATH_RUN_GUESS_INPUT}
                {...register("input")}
              />
              {filteredGames.length > 0 && (
                <ComboboxContent sideOffset={8} side="top" align="center">
                  <ComboboxList>
                    {filteredGames.map((game) => (
                      <ComboboxItem
                        key={game.id}
                        value={game.title}
                        className="font-mono"
                        onClick={() => handleGuess(game.title, game.id)}
                      >
                        {game.title}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              )}
            </Combobox>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeathRunPlaying
