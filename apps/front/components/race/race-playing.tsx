"use client"

import { Timestamp } from "@firebase/firestore"
import { zodResolver } from "@hookform/resolvers/zod"
import { type MarathonSeedDocWithId, type RaceDocWithId, type RaceRunDocWithId } from "@repo/schemas"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import useSound from "use-sound"
import z from "zod"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { SOUNDS } from "@/constants/sound"
import { useCountdown, useIsExpired } from "@/hooks/use-countdown"
import { useIsMobile } from "@/hooks/use-mobile"
import { useGetAllGamesNamesQuery } from "@/redux/api/games"
import { useFinishRaceRunMutation, useSubmitRaceAnswerMutation } from "@/redux/api/race"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const formatTime = (seconds: number) => {
  const m = Math.max(0, Math.floor(seconds / 60))
  const s = Math.max(0, seconds % 60)

  return `${m}:${s.toString().padStart(2, "0")}`
}

const schema = z.object({
  input: z.string().min(1, "Answer cannot be empty"),
})

type Schema = z.infer<typeof schema>

const RacePlaying = ({
  race,
  run,
  seed,
}: {
  race: RaceDocWithId
  run: RaceRunDocWithId
  seed: MarathonSeedDocWithId
}) => {
  const uid = useAppSelector(selectUserId)
  const isMobile = useIsMobile()

  const { data: allGames } = useGetAllGamesNamesQuery()
  const [submitAnswer] = useSubmitRaceAnswerMutation()
  const [finishRun] = useFinishRaceRunMutation()

  const [comboboxKey, setComboboxKey] = useState(0)
  const [playCorrect] = useSound(SOUNDS.CORRECT_GAME)
  const [playWrong] = useSound(SOUNDS.WRONG)

  const isHost = race.hostId === uid
  const startMs = race.startedAt ? race.startedAt.seconds * 1000 : Date.now()
  const timestampStart = Timestamp.fromMillis(startMs)
  const roundDuration = race.duration

  const isExpired = useIsExpired(timestampStart, roundDuration)
  const { timeRemaining } = useCountdown(timestampStart, roundDuration)
  const isTimeCritical = timeRemaining <= 30

  const {
    register,
    watch,
    reset,
  } = useForm<Schema>({
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
    if (!race.seedId) return

    const isCorrect = guessedGameId === gameId
    if (isCorrect)
      playCorrect()
    else
      playWrong()

    await submitAnswer({
      raceId: race.id,
      uid,
      roundIndex: run.currentRoundIndex,
      gameId,
      startedAt: startMs,
      seedId: race.seedId,
      currentRoundIndex: run.currentRoundIndex,
      currentScore: run.score,
      seedRoundsCount: seed.rounds.length,
      answer: gameTitle,
      isCorrect,
    })

    reset()
    setComboboxKey((k) => k + 1)
  }

  useEffect(() => {
    if (!isExpired || !uid) return

    finishRun({
      raceId: race.id,
      uid,
      isHost,
    }).catch(() => {
      console.error("Failed to finish race run on timer expiry")
    })
  }, [isExpired])

  return (
    <div className="h-full-height flex flex-col">
      {/* Header: timer + score */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/80 backdrop-blur">
        <span className="text-sm text-muted-foreground">
          Round <span data-testid="race-round-index" className="font-mono font-bold text-foreground">{run.currentRoundIndex + 1}</span>
        </span>
        <span data-testid="race-timer" className={`font-mono text-2xl font-bold tabular-nums ${isTimeCritical ? "text-destructive animate-pulse" : ""}`}>
          {formatTime(timeRemaining)}
        </span>
        <span data-testid="race-score" className="font-mono font-bold text-primary">{run.score} pts</span>
      </div>

      {/* Image */}
      <div className="relative flex-1 overflow-hidden">
        {imageUrl && isSpherical && (<ReactSphere src={imageUrl} />)}
        {imageUrl && !isSpherical && (
          <Image
            src={imageUrl}
            alt="Guess the game"
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Input overlay */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-6">
          <Combobox key={comboboxKey}>
            <ComboboxInput
              showTrigger={false}
              type="text"
              placeholder="Guess the game…"
              autoFocus={!isMobile}
              className="dark:bg-background/60 font-mono! text-xl font-bold placeholder:text-foreground/70 w-96 py-5"
              data-testid="race-guess-input"
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
      </div>
    </div>
  )
}

export default RacePlaying
