import { ROUND_TYPE } from "@repo/common"
import { ReactSphere } from "@/components/providers/react-sphere"
import { FALL_BACK_IMAGE } from "@/constants/mapping"
import { usePanoUrl } from "@/hooks/use-pano-url"
import { usePathname } from "@/i18n/routing"
import { selectCurrentRoundData } from "@/redux/lobby/lobby.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const PlayingNormalRound = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const cachedSphereUrl = usePanoUrl(currentRoundData?.sphericalId, currentRoundData?.sphericalImageUrl)
  const sphereSrc = cachedSphereUrl || currentRoundData?.sphericalImageUrl

  const cachedFlatUrl = usePanoUrl(currentRoundData?.flatId, currentRoundData?.flatImageUrl)
  const flatSrc = cachedFlatUrl || currentRoundData?.flatImageUrl || FALL_BACK_IMAGE

  if (!currentRoundData) return null

  return (
    <article>
      {currentRoundData.type === ROUND_TYPE.SPHERICAL && sphereSrc && (
        <div className="h-full-height">
          <ReactSphere src={sphereSrc} />
        </div>
      )}
      {currentRoundData.type === ROUND_TYPE.FLAT && (
        <img src={flatSrc} alt="Current round image" className="aspect-video size-full max-h-full-height object-contain" />
      )}
    </article>
  )
}

export default PlayingNormalRound
