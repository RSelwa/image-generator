import { ROUND_TYPE } from "@repo/common"
import { driver } from "driver.js"
import Image from "next/image"
import { useEffect, useRef } from "react"
import { ReactSphere } from "@/components/providers/react-sphere"
import { ImageGlow } from "@/components/ui/image-glow"
import { DRIVER_IDS, STEPS } from "@/constants/driver"
import { ASSET_URLS, FALL_BACK_IMAGE, STORAGE_KEYS } from "@/constants/mapping"
import { usePanoUrl } from "@/hooks/use-pano-url"
import { useLocalStorage } from "@/hooks/use-storage"
import { usePathname } from "@/i18n/routing"
import { useSelectOptionIndexMutation, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { selectCurrentRoundData, selectCurrentRoundIndex, selectHasSelectedOption, selectSelectedOption } from "@/redux/lobby/lobby.selectors"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getLobbyIdFromPathname } from "@/utils"
import "driver.js/dist/driver.css"

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

  const driverRef = useRef<ReturnType<typeof driver> | null>(null)

  const selectRound = async (index: number) => {
    driverRef.current?.destroy()
    await selectOptionIndex({
      lobbyId,
      playerId: user?.id || "",
      roundIndex: lobby?.currentRound || 0,
      selectedOptionIndex: index,
    })
  }

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
      onCloseClick: () => setIsSkipDriver(true)
    })

    driverRef.current = driverObj
    driverObj.drive()
  }

  useEffect(() => {
    initDriver()

    return () => {
      driverRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    driverRef.current?.destroy()
  }, [roundIndex])

  const cachedSphereUrl = usePanoUrl(selectedOption?.sphericalId, selectedOption?.sphericalImage)
  const sphereSrc = cachedSphereUrl || selectedOption?.sphericalImage || ""

  const cachedFlatUrl = usePanoUrl(selectedOption?.flatId, selectedOption?.flatImage)
  const flatSrc = cachedFlatUrl || selectedOption?.flatImage || FALL_BACK_IMAGE

  if (!currentRoundData) return null

  return (
    <section data-testid="special-round" className="h-full-height">
      {!hasSelectedOption && (
        <article
          className="flex items-center justify-center h-full bg-repeat bg-center bg-size-[25%]"
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
                      onClick={() => selectRound(index)}
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
              <ReactSphere src={sphereSrc} />
            </div>
          )}
          {selectedOption?.type === ROUND_TYPE.FLAT && (
            <img src={flatSrc} alt="Selected option" className="aspect-video size-full object-contain" />
          )}
        </>
      )}

    </section>
  )
}

export default PlayingSpecialRound
