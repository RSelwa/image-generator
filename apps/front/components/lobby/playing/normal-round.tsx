import { ROUND_TYPE } from "@repo/common"
import Image from "next/image"
import { usePathname } from "next/navigation"
import * as React from "react"
import { ReactSphere } from "@/components/providers/react-sphere"
import { selectCurrentRoundData } from "@/redux/lobby/lobby.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const PlayingNormalRound = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))

  if (!currentRoundData) return null

  return (
    <article>
      {currentRoundData.type === ROUND_TYPE.SPHERICAL && currentRoundData.sphericalImageUrl && (
        <div className="h-full-height">
          <ReactSphere src={currentRoundData.sphericalImageUrl} />
        </div>
      )}
      {currentRoundData.type === ROUND_TYPE.FLAT && (
        <Image src={currentRoundData.flatImageUrl || ""} alt="Current round image" width={1920} height={1080} />
      )}

    </article>
  )
}

export default PlayingNormalRound
