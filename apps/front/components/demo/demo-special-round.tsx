"use client"

import { ROUND_TYPE } from "@repo/common"
import Image from "next/image"
import * as React from "react"
import { useDemoContext } from "@/components/demo/demo-context"
import { ReactSphere } from "@/components/providers/react-sphere"
import { ImageGlow } from "@/components/ui/image-glow"
import { FALL_BACK_IMAGE } from "@/constants/mapping"

const DemoSpecialRound = () => {
  const { currentRound, hasSelectedOption, selectedOption, selectOption } = useDemoContext()

  if (!currentRound) return null

  return (
    <section data-testid="demo-special-round" className="h-full-height">
      {!hasSelectedOption && (
        <article className="flex h-full pb-20 flex-col items-center gap-14 justify-center text-primary">
          <p className="text-center font-bold text-2xl">Bonus Round</p>
          <div className="grid grid-cols-2 gap-0 mx-auto">
            {currentRound.options?.map((option, index) => (
              <div key={option.gameId} className="size-48">
                <ImageGlow isBlurOnHover>
                  <Image
                    data-testid={`demo-thumbnail-option-${index}`}
                    onClick={() => selectOption(index)}
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
            <span>X2</span>
            <span>No map</span>
          </div>
        </article>
      )}

      {hasSelectedOption && selectedOption && (
        <>
          {selectedOption.type === ROUND_TYPE.SPHERICAL && (
            <div className="size-full">
              <ReactSphere src={selectedOption.sphericalImage || ""} />
            </div>
          )}
          {selectedOption.type === ROUND_TYPE.FLAT && (
            <Image src={selectedOption.flatImage || FALL_BACK_IMAGE} alt="Selected option" width={1920} height={1080} className="aspect-video size-full object-contain" />
          )}
        </>
      )}
    </section>
  )
}

export default DemoSpecialRound
