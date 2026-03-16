import { calculateDistancePoints, getDistance, ROUND_POINTS } from "@repo/common"
import { usePathname } from "@/i18n/routing"
import { type FormEvent } from "react"
import * as React from "react"
import { useState } from "react"
import { type Position } from "@/components/mini-map"
import MiniMap from "@/components/mini-map"
import { Button } from "@/components/ui/button"
import { useSubmitRoundAnswerMutation } from "@/redux/api/lobby"
import { selectCurrentPlayerRoundAnswer, selectCurrentRoundData, selectCurrentRoundIndex } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const GameMapGuess = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [playPosition, setPlayerPosition] = useState<Position | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const [submitRoundAnswer] = useSubmitRoundAnswerMutation()

  const user = useAppSelector(selectUser)
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const myAnswer = useAppSelector(selectCurrentPlayerRoundAnswer(lobbyId, roundIndex))

  if (!currentRoundData || !currentRoundData.mapPosition) return null

  const submitDistance = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentRoundData || !currentRoundData.mapPosition || !playPosition) return

    const distance = getDistance(currentRoundData.mapPosition, playPosition)

    const distancePoints = calculateDistancePoints(distance, currentRoundData.pointsDistance || ROUND_POINTS.DISTANCE, currentRoundData.maxDistancePoints || ROUND_POINTS.DISTANCE)

    await submitRoundAnswer({
      lobbyId,
      roundIndex,
      uid: user?.id || "",
      answer: {
        position: playPosition,
        positionDistance: distance,
        distancePoints,
        points: (myAnswer?.gamePoints || 0) + distancePoints,
      },
    })
  }

  return (
    <form
      data-testid="game-map-guess-form"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onSubmit={submitDistance}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
    >
      <p className="w-full bg-background font-mono text-foreground py-1 flex text-center items-center justify-around text-shadow font-semibold">
        <span className="text-primary">+</span>
        <span>
          {currentRoundData.gameTitle}
          </span>
        <span className="text-primary">+</span>
      </p>

      <MiniMap
        mapData={{
          mapImage: currentRoundData.mapImage || "",
          size: {
            width: currentRoundData.mapWidth || 0,
            height: currentRoundData.mapHeight || 0,
          },
          correctPosition: currentRoundData.mapPosition,
        }}
        showCorrectMarker={false}
        guessPosition={playPosition}
        onMapClick={setPlayerPosition}
        inline
        isParentHover={isHovered}
      />

      <Button disabled={!playPosition} variant={playPosition? "marathon":"marathon-outline" } data-testid="map-submit" type="submit" className="w-full">
        Guess
      </Button>
    </form>
  )
}

export default GameMapGuess
