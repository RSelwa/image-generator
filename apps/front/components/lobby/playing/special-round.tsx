import { ROUND_TYPE } from "@repo/common"
import Image from "next/image"
import { usePathname } from "next/navigation"
import * as React from "react"
import { ReactSphere } from "@/components/providers/react-sphere"
import { ImageGlow } from "@/components/ui/image-glow"
import { useSelectOptionIndexMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectCurrentRoundData, selectCurrentRoundIndex, selectHasSelectedOption, selectSelectedOption } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"

const PlayingSpecialRound = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const [selectOptionIndex] = useSelectOptionIndexMutation()

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const user = useAppSelector(selectUser)
  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const hasSelectedOption = useAppSelector(selectHasSelectedOption(lobbyId, roundIndex))
  const selectedOption = useAppSelector(selectSelectedOption(lobbyId, roundIndex))

  if (!currentRoundData) return null

  return (
    <section className="h-full-height ">
      {!hasSelectedOption && (
        <article className="flex h-full pb-20 flex-col items-center gap-14 justify-center text-background">
          <p className="text-center font-bold text-2xl"> Bonus Round </p>
          <div className="grid grid-cols-2 gap-0 mx-auto">
            {currentRoundData.options?.map((option, index) => (
              <ImageGlow key={option.gameId} isBlurOnHover>
                <Image
                  onClick={async () => await selectOptionIndex({
                    lobbyId,
                    playerId: user?.id || "",
                    roundIndex: lobby?.currentRound || 0,
                    selectedOptionIndex: index,
                  })}
                  src={option.thumbnailUrl || ""}
                  alt={`Option ${index + 1}`}
                  width={300}
                  height={300}
                  className="aspect-square size-32 scale-75 hover:scale-100 transition-transform cursor-pointer rounded-lg object-cover"
                />
              </ImageGlow>

            ))}
          </div>
          <div className="flex items-center gap-8 font-semibold text-lg">
            <span>X2</span>
            <span>No map</span>
          </div>
        </article>
      )}

      {hasSelectedOption && selectedOption && (
        <>

          {selectedOption?.type === ROUND_TYPE.FLAT && (
            <Image src={selectedOption.flatImage || ""} alt="Selected option" width={1920} height={1080} className="aspect-video size-full object-contain" />
          )}
          {selectedOption?.type === ROUND_TYPE.SPHERICAL && (
            <div className="size-full">
              <ReactSphere src={selectedOption.sphericalImage || ""} />
            </div>
          )}
        </>

      )}

    </section>
  )
}

export default PlayingSpecialRound
