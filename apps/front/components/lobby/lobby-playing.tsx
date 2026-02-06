import { ROUND_TYPE } from "@repo/common"
import Image from "next/image"
import * as React from "react"
import { ReactSphere } from "@/components/providers/react-sphere"
import { useSubscribeLobbyQuery } from "@/redux/api/lobby"

type Props = {
  lobbyId: string
}

const LobbyPlaying = ({ lobbyId }: Props) => {
  const { data: lobby, isLoading: isLobbyLoading } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  if (isLobbyLoading || !lobby) {
    return <div>Loading...</div>
  }

  const currentRoundData = lobby.currentRoundData

  return (
    <main className="min-h-full-height">
      <section>
        <p>
          Level: {lobby.currentRound}/{lobby.config.numberOfRounds}
        </p>
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
          </article>
        )}
      </section>
    </main>
  )
}

export default LobbyPlaying
