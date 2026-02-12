"use client"

import { ROUND_TYPE } from "@repo/common"
import Image from "next/image"
import * as React from "react"
import { useDemoContext } from "@/components/demo/demo-context"
import { ReactSphere } from "@/components/providers/react-sphere"
import { FALL_BACK_IMAGE } from "@/constants/mapping"

const DemoNormalRound = () => {
  const { currentRound } = useDemoContext()

  if (!currentRound) return null

  return (
    <article>
      {currentRound.type === ROUND_TYPE.SPHERICAL && currentRound.sphericalImageUrl && (
        <div className="h-full-height">
          <ReactSphere src={currentRound.sphericalImageUrl} />
        </div>
      )}
      {currentRound.type === ROUND_TYPE.FLAT && (
        <Image src={currentRound.flatImageUrl || FALL_BACK_IMAGE} alt="Current round image" width={1920} height={1080} className="aspect-video size-full max-h-full-height object-contain" />
      )}
    </article>
  )
}

export default DemoNormalRound
