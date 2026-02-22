import { ROUND_TYPE } from "@repo/common"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ReactSphere } from "@/components/providers/react-sphere"
import { ImageGlow } from "@/components/ui/image-glow"
import { ASSET_URLS, FALL_BACK_IMAGE, STORAGE_KEYS } from "@/constants/mapping"
import { useSelectOptionIndexMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectCurrentRoundData, selectCurrentRoundIndex, selectHasSelectedOption, selectSelectedOption } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"
import { useLocalStorage } from "@/hooks/use-storage"
import { DRIVER_IDS, STEPS } from "@/constants/driver"
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react"

const PlayingSpecialRound = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

    const [isSkipDriver, setIsSkipDriver] = useLocalStorage(STORAGE_KEYS.DRIVER_SPECIAL_ROUND, false)
  
  const [selectOptionIndex] = useSelectOptionIndexMutation()

  const { data: lobby } = useSubscribeLobbyQuery({ id: lobbyId }, {
    skip: !lobbyId,
  })

  const user = useAppSelector(selectUser)
  const roundIndex = useAppSelector(selectCurrentRoundIndex(lobbyId))
  const currentRoundData = useAppSelector(selectCurrentRoundData(lobbyId))
  const hasSelectedOption = useAppSelector(selectHasSelectedOption(lobbyId, roundIndex))
  const selectedOption = useAppSelector(selectSelectedOption(lobbyId, roundIndex))

  const initDriver = () => {
    if (isSkipDriver) return

    const driverObj = driver({
      showProgress: true,
      steps: [
        STEPS.SPECIAL_ROUND_MAIN,
        STEPS.SPECIAL_ROUND_SELECTION,
        STEPS.SPECIAL_ROUND_X2,
        STEPS.SPECIAL_ROUND_NO_MAP,
      ],
      overlayColor: "rgba(0, 0, 0, 0.9)",
      allowKeyboardControl: true,
      allowClose: false,
      onDestroyed: () => setIsSkipDriver(true)
    });

    driverObj.drive();
  }

  useEffect(initDriver, [])

  if (!currentRoundData) return null

  return (
    <section data-testid="special-round" className="h-full-height">
      {!hasSelectedOption && (
        <article className="flex items-center justify-center h-full bg-repeat bg-center bg-size-[25%]"
        style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}
        >
          <div id={DRIVER_IDS.SPECIAL_ROUND_MAIN} className="flex flex-col items-center gap-14 justify-center text-primary bg-background/80">

          <p className="text-center font-bold text-2xl"> Round bonus </p>
          <div id={DRIVER_IDS.SPECIAL_ROUND_SELECTION} className="grid grid-cols-2 gap-0 mx-auto">
            {currentRoundData.options?.map((option, index) => (
              <div key={option.gameId} className="size-48">
                <ImageGlow isBlurOnHover>
                  <Image
                    data-testid={`game-thumbnail-option-${index}`}
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
                    className="aspect-square scale-75 hover:scale-100 transition-transform cursor-pointer rounded-lg object-cover"
                  />
                </ImageGlow>
              </div>

            ))}
          </div>
          <div className="flex items-center gap-8 font-semibold text-lg">
            <span id={DRIVER_IDS.SPECIAL_ROUND_X2}>X2</span>
            <span id={DRIVER_IDS.SPECIAL_ROUND_NO_MAP}>No map</span>
          </div>
          </div>

        </article>
      )}

      {hasSelectedOption && selectedOption && (
        <>
          {selectedOption?.type === ROUND_TYPE.SPHERICAL && (
            <div className="size-full">
              <ReactSphere src={selectedOption.sphericalImage || ""} />
            </div>
          )}
          {selectedOption?.type === ROUND_TYPE.FLAT && (
            <Image src={selectedOption.flatImage || FALL_BACK_IMAGE} alt="Selected option" width={1920} height={1080} className="aspect-video size-full object-contain" />
          )}
        </>
      )}

    </section>
  )
}

export default PlayingSpecialRound
