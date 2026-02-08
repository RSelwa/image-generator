import { ROUND_TYPE } from "@repo/common"
import Image from "next/image"
import * as React from "react"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { useSelectOptionIndexMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectCurrentRoundData, selectCurrentRoundIndex, selectHasSelectedOption, selectSelectedOption } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type Props = {
  lobbyId: string
}

const PlayingSpecialRound = ({ lobbyId }: Props) => {
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
    <article>
      <div className="h-full-height bg-primary ">

        {!hasSelectedOption && (
          <div className="grid grid-cols-2 pt-52 gap-4 w-1/2 mx-auto">
            {currentRoundData.options?.map((option, index) => (
              <Button
                key={option.gameId}
                onClick={async () => await selectOptionIndex({
                  lobbyId,
                  playerId: user?.id || "",
                  roundIndex: lobby?.currentRound || 0,
                  selectedOptionIndex: index,
                })}
                className="mb-8"
              >
                <Image src={option.thumbnailUrl || ""} alt={`Option ${index + 1}`} width={100} height={100} className="mb-4" />
              </Button>
            ))}
          </div>
        )}

        {hasSelectedOption && selectedOption && (
          <>

            {selectedOption?.type === ROUND_TYPE.FLAT && (
              <Image src={selectedOption.flatImage || ""} alt="Selected option" width={1920} height={1080} className=" size-full" />
            )}
            {selectedOption?.type === ROUND_TYPE.SPHERICAL && (
              <div className="size-full">
                <ReactSphere src={selectedOption.sphericalImage || ""} />
              </div>
            )}
          </>

        )}

      </div>
    </article>
  )
}

export default PlayingSpecialRound
