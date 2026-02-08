import { Timestamp } from "@firebase/firestore"
import { isSameNormalized, ROUND_POINTS } from "@repo/common"
import { usePathname } from "next/navigation"
import { type FormEvent } from "react"
import * as React from "react"
import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { useIncrementPlayerLivesUsedMutation, useSubmitRoundAnswerMutation } from "@/redux/api/lobby"
import { selectCurrentRoundData, selectCurrentRoundIndex, selectLobbyConfig, selectMyLivesRemaining, selectSelectedOption } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const GameInputGuess = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const gameFormRef = useRef<HTMLFormElement>(null)

  const [submitRoundAnswer] = useSubmitRoundAnswerMutation()
  const [incrementLivesUsed] = useIncrementPlayerLivesUsedMutation()

  const user = useAppSelector(selectUser)
  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const selectedOption = useAppSelector(selectSelectedOption(lobbyId, roundIndex))
  const config = useAppSelector(selectLobbyConfig(lobbyId))
  const livesRemaining = useAppSelector(selectMyLivesRemaining(lobbyId, roundIndex))

  const verifyGameName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)
    const input = formdata.get("input")

    if (!currentRoundData) return
    const playerAnswerValue = input?.toString() || ""

    const correctGameName = selectedOption?.gameTitle || currentRoundData.gameTitle || ""

    const isCorrect = Boolean(correctGameName && isSameNormalized(correctGameName, playerAnswerValue))

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
      incrementLivesUsed({ lobbyId, playerId: user?.id || "", roundIndex })
      gameFormRef.current?.reset()
    }
  }

  return (
    <form ref={gameFormRef} onSubmit={verifyGameName} autoComplete="off" className="absolute z-10 left-1/2 -translate-1/2 bottom-8 flex flex-col items-center gap-4">
      {config?.playersLives && (

        <div className="w-full flex justify-center items-center gap-8">
          {
            Array.from({ length: config.playersLives }, (_, i) => (
              <div
                key={i}
                data-is-filled={i < livesRemaining}
                className="size-6 transition-colors data-[is-filled=false]:shadow-glow-xs data-[is-filled=false]:shadow-red-600/70 data-[is-filled=true]:bg-neutral-50 border border-secondary data-[is-filled=false]:bg-red-500/30"
              />
            ))
          }
        </div>
      )}
      <Input
        name="input"
        type="text"
        placeholder="Your answer"
        autoFocus
        className="bg-neutral-600/50 text-2xl! font-bold placeholder:text-neutral-100 text-neutral-50 min-w-96 py-6"
      />
    </form>
  )
}

export default GameInputGuess
