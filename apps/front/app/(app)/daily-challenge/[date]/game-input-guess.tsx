import { zodResolver } from "@hookform/resolvers/zod"
import { isSameNormalized } from "@repo/common"
import { useState } from "react"
import { useForm } from "react-hook-form"
import useSound from "use-sound"
import z from "zod"
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { SOUNDS } from "@/constants/sound"
import { useIsMobile } from "@/hooks/use-mobile"
import { useGetDailyChallengeEntityByDateQuery, useSubmitDailyChallengeResultMutation } from "@/redux/api/daily-challenge"
import { useGetAllGamesNamesQuery } from "@/redux/api/games"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const schema = z.object({
  input: z.string().min(1, "Answer cannot be empty"),
})

type Schema = z.infer<typeof schema>

const GameInputGuessDaily = ({ date }: { date: string }) => {
  const userId = useAppSelector(selectUserId)

  const isMobile = useIsMobile()

  const { data: allGamesNames } = useGetAllGamesNamesQuery()
  const { data: challenge, isLoading } = useGetDailyChallengeEntityByDateQuery({ date })

  const [submitResult, { isLoading: isSubmitting }] = useSubmitDailyChallengeResultMutation()

  const [comboboxKey, setComboboxKey] = useState(0)
  const [playCorrect] = useSound(SOUNDS.CORRECT_GAME)
  const [playWrong] = useSound(SOUNDS.WRONG)

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { input: "" },
  })

  const lowerCaseInput = (watch("input") || "").toLocaleLowerCase().trim()

  const gameList = allGamesNames?.filter(({ title }) => title.trim().toLocaleLowerCase().includes(lowerCaseInput)) || []

  const verifyGameName = async (data: Schema) => {
    const input = data.input.trim()

    if (!challenge || isSubmitting) return

    const playerAnswerValue = input?.toString() || ""

    const { gameTitle, gameAlternateNames } = challenge

    const isCorrect = isSameNormalized(gameTitle, playerAnswerValue) || gameAlternateNames.some((name) => isSameNormalized(name, playerAnswerValue))

    if (isCorrect) {
      playCorrect()
      await submitResult({ answer: input, date, isCorrect, uid: userId! })
    } else {
      playWrong()
      reset()
      setComboboxKey((k) => k + 1)
    }
  }

  const handleClickItem = (value: string) => {
    setValue("input", value, { shouldDirty: true })
    handleSubmit(verifyGameName)()
  }

  if (isLoading) return null

  return (
    <form onSubmit={handleSubmit(verifyGameName)} autoComplete="off" className="absolute z-10 w-full left-1/2 -translate-1/2 bottom-0 flex flex-col items-center gap-4">
      <Combobox key={comboboxKey}>
        <ComboboxInput
          showTrigger={false}
          data-testid="game-input-guess"
          type="text"
          placeholder="Your answer"
          autoFocus={!isMobile}
          className="dark:bg-background/50 font-mono! text-2xl font-bold placeholder:text-foreground/70 text-foreground w-96 py-6"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(verifyGameName)()}
          {...register("input")}
        />
        {gameList?.length > 0 && (
          <ComboboxContent sideOffset={8} side="top" align="center">
            <ComboboxList>
              {gameList?.map((game) => (
                <ComboboxItem key={game.id} value={game.title} className="font-mono" onClick={() => handleClickItem(game.title)}>
                  {game.title}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        )}
      </Combobox>
    </form>
  )
}

export default GameInputGuessDaily
