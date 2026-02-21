import { Timestamp } from "@firebase/firestore"
import { isSameNormalized, ROUND_POINTS } from "@repo/common"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useIncrementPlayerLivesUsedMutation, useSubmitRoundAnswerMutation } from "@/redux/api/lobby"
import { selectCurrentRoundData, selectCurrentRoundIndex, selectLobbyConfig, selectMyLivesRemaining, selectSelectedOption } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { useGetAllGamesNamesQuery } from "@/redux/api/games"
import { useIsMobile } from "@/hooks/use-mobile"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"


const schema = z.object({
  input: z.string().min(1, "Answer cannot be empty"),
})

type Schema = z.infer<typeof schema>

const GameInputGuess = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [submitRoundAnswer] = useSubmitRoundAnswerMutation()
  const [incrementLivesUsed] = useIncrementPlayerLivesUsedMutation()

  const { data: allGamesNames } = useGetAllGamesNamesQuery()

  const user = useAppSelector(selectUser)
  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const selectedOption = useAppSelector(selectSelectedOption(lobbyId, roundIndex))
  const config = useAppSelector(selectLobbyConfig(lobbyId))
  const livesRemaining = useAppSelector(selectMyLivesRemaining(lobbyId, roundIndex))


  const [comboboxKey, setComboboxKey] = useState(0)

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    reset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { input: "" },
  })

  const lowerCaseInput = (getValues("input") || "").toLocaleLowerCase().trim()

  const gameList = allGamesNames?.filter(({ title }) => title.trim().toLocaleLowerCase().includes(lowerCaseInput)) || []

  const verifyGameName = async (data: Schema) => {
    const input = data.input.trim()

    if (!currentRoundData) return

    const playerAnswerValue = input?.toString() || ""

    const correctGameName = selectedOption?.gameTitle || currentRoundData.gameTitle || ""
    const alternateNames = selectedOption?.gameAlternateNames || currentRoundData.gameAlternateNames || []

    const isCorrect = Boolean(correctGameName && (isSameNormalized(correctGameName, playerAnswerValue) || alternateNames.some((name) => isSameNormalized(name, playerAnswerValue))))

    if (isCorrect) {
      await submitRoundAnswer({
        lobbyId,
        roundIndex,
        uid: user?.id || "",
        answer: {
          answer: playerAnswerValue,
          submittedAt: Timestamp.now(),
          isCorrect: true,
          gamePoints: ROUND_POINTS.GAME_GUESS,
          points: ROUND_POINTS.GAME_GUESS,
        },
      })
    } else {
      await incrementLivesUsed({ lobbyId, playerId: user?.id || "", roundIndex })
      reset()
      setComboboxKey((k) => k + 1)
    }
  }

  const handleClickItem = (value: string) => {
    setValue("input", value, { shouldDirty: true })
    handleSubmit(verifyGameName)()
  }

  return (
    <form onSubmit={handleSubmit(verifyGameName)} autoComplete="off" className="absolute z-10 w-full left-1/2 -translate-1/2 bottom-8 flex flex-col items-center gap-4">
      <Button onClick={() => { reset(); setComboboxKey((k) => k + 1) }}>Test </Button>
      {config?.playersLives && (
        <div data-testid="lives-container" className="w-full flex justify-center items-center gap-8">
          {
            Array.from({ length: config.playersLives }, (_, i) => (
              <div
                key={i}
                data-is-filled={i < livesRemaining}
                className="size-6 transition-colors data-[is-filled=false]:shadow-glow-xs data-[is-filled=false]:shadow-destructive/70 data-[is-filled=true]:bg-primary data-[is-filled=true]:shadow-primary/70 border border-secondary data-[is-filled=false]:bg-destructive/30"
              />
            ))
          }
        </div>
      )}
      <Combobox key={comboboxKey}>
        <ComboboxInput
          showTrigger={false}
          data-testid="game-input-guess"
          type="text"
          placeholder="Your answer"
          autoFocus
          className="dark:bg-background/50 font-mono! text-2xl font-bold placeholder:text-foreground/70 text-foreground w-96 py-6"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(verifyGameName)()}
          {...register("input")}
        />
        {gameList?.length > 0 && <ComboboxContent sideOffset={8} side="top" align="center">
          <ComboboxList>
            {gameList?.map((game) => (
              <ComboboxItem key={game.id} value={game.title} className="font-mono" onClick={() => handleClickItem(game.title)}>
                {game.title}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
        }
      </Combobox>
    </form>
  )
}

export default GameInputGuess
