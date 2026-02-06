import { Timestamp } from "@firebase/firestore"
import { calculateDistancePoints, getDistance, isSameNormalized, ROUND_POINTS, ROUND_TYPE } from "@repo/common"
import { type PlayerAnswer } from "@repo/schemas"
import Image from "next/image"
import { type FormEvent } from "react"
import * as React from "react"
import { useState } from "react"
import { type Position } from "@/components/mini-map"
import MiniMap from "@/components/mini-map"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useListenRoundAnswerQuery, useSubmitRoundAnswerMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type Props = {
  lobbyId: string
}

const LobbyPlaying = ({ lobbyId }: Props) => {
  const user = useAppSelector(selectUser)
  const [playPosition, setPlayerPosition] = useState<Position>({ x: 50, y: 50 })

  const [submitRoundAnswer] = useSubmitRoundAnswerMutation()

  const { data: lobby, isLoading: isLobbyLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })
  const { data: roundAnswer } = useListenRoundAnswerQuery({ lobbyId, roundIndex: lobby?.currentRound || 0 }, {
    skip: !lobbyId || !lobby || !lobby.currentRound || lobby.currentRound === 0,

  })

  if (isLobbyLoading || !lobby) {
    return <div>Loading...</div>
  }

  const myAnswer = roundAnswer?.answers?.find((answer) => answer.uid === user?.id)

  const currentRoundData = lobby.currentRoundData

  const submitAnswer = async (answer: Partial<PlayerAnswer>) => {
    try {
      await submitRoundAnswer({
        lobbyId,
        roundIndex: lobby.currentRound,
        uid: user?.id || "",
        answer,
      })
    } catch (error) {
      console.error("Error submitting answer:", error)
    }
  }

  const verifyGameName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)
    const input = formdata.get("input")

    if (!currentRoundData) return

    const isCorrect = Boolean(currentRoundData.gameTitle && isSameNormalized(currentRoundData.gameTitle, input?.toString() || ""))

    if (isCorrect) {
      await submitAnswer({
        submittedAt: Timestamp.now(),
        isCorrect: true,
        points: ROUND_POINTS.GAME_GUESS,
      })
    }
  }

  const submitDistance = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentRoundData || !currentRoundData.mapPosition) return

    const distance = getDistance(currentRoundData.mapPosition, playPosition)

    const distancePoints = calculateDistancePoints(distance, currentRoundData.pointsDistance || ROUND_POINTS.DISTANCE, currentRoundData.maxDistancePoints || ROUND_POINTS.DISTANCE)

    submitAnswer({
      position: playPosition,
      positionDistance: distance,
      points: distancePoints + (myAnswer?.points || 0), // Add to existing points from game guess
    })
  }

  return (
    <main className="min-h-full-height">
      <section>
        <p>
          Level: {lobby.currentRound}/{lobby.config.numberOfRounds}
        </p>
        {myAnswer && (
          <div>
            <span>
              Is correct
              {myAnswer.isCorrect ? "✅" : "❌"}

            </span>
            <span>
              Your points: {myAnswer.points}
            </span>

          </div>
        )}
        {!currentRoundData && (
          <article>
            No data
          </article>
        )}
        {currentRoundData && (
          <article>
            {currentRoundData.type === ROUND_TYPE.SPHERICAL && currentRoundData.sphericalImageUrl && (
              <div className="w-96 aspect-video">
                <ReactSphere src={currentRoundData.sphericalImageUrl} />
              </div>
            )}
            {currentRoundData.type === ROUND_TYPE.FLAT && (
              <Image src={currentRoundData.flatImageUrl || ""} alt="Current round image" width={1920} height={1080} />
            )}

            <Image src={currentRoundData.gameThumbnailUrl || ""} alt="Current round answer image" width={400} height={400} />
            <h1>{currentRoundData.gameTitle}</h1>
            {!myAnswer?.isCorrect && (
              <form onSubmit={verifyGameName}>

                <Input
                  name="input"
                  type="text"
                  placeholder="Your answer"
                />
              </form>
            )}

            {myAnswer?.isCorrect && currentRoundData.mapPosition && (
              <form onSubmit={submitDistance}>
                <span>
                  You found the answer!
                </span>
                <span>Distance {getDistance(currentRoundData.mapPosition, playPosition)}</span>
                <span>Points: {calculateDistancePoints(getDistance(currentRoundData.mapPosition, playPosition), currentRoundData.pointsDistance, 37)}</span>

                <MiniMap
                  mapData={{
                    mapImage: currentRoundData.mapImage || "",
                    size: {
                      width: currentRoundData.mapWidth || 0,
                      height: currentRoundData.mapHeight || 0,
                    },
                    correctPosition: currentRoundData.mapPosition,

                  }}
                  guessPosition={playPosition}
                  onMapClick={setPlayerPosition}
                />

                <Button type="submit">
                  Guess
                </Button>
              </form>
            )}
          </article>
        )}
      </section>
    </main>
  )
}

export default LobbyPlaying
