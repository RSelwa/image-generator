import { usePathname } from "next/navigation"
import * as React from "react"
import { ASSET_URLS } from "@/constants/mapping"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

const LobbyStarting = () => {
  const [progress, setProgress] = useState(0)

useEffect(() => {
  let current = 0

  const interval = setInterval(() => {
    current += 2
    setProgress(current)
    if (current >= 100) clearInterval(interval)
  }, 110)

  return () => clearInterval(interval)
}, [])


  return (
    <main className="min-h-full-height relative flex items-center justify-center bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute top-0 left-0 z-0 rotate-180"/>
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute bottom-0 right-0 z-0"/>
      <Progress className="w-1/2 h-15 z-10" value={progress} />
    </main>
  )
}

export default LobbyStarting
