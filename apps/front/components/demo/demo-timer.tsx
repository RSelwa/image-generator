"use client"

import * as React from "react"
import { useDemoContext } from "@/components/demo/demo-context"

const DemoTimer = () => {
  const { timeRemaining } = useDemoContext()

  return (
    <span className="absolute z-10 top-4 left-1/2 -translate-x-1/2 font-bold text-white drop-shadow-2xl text-center text-6xl">
      {timeRemaining}
    </span>
  )
}

export default DemoTimer
