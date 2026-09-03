import { LoaderCircle } from "lucide-react"
import Image from "next/image"
import { ASSET_URLS } from "@/constants/mapping"

const LoadingGameData = () => {
  return (
    <main className="min-h-full-height flex items-center justify-center relative bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      <LoaderCircle className="size-50 text-primary animate-spin" />
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute top-0 left-0 z-0 rotate-180" />
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute bottom-0 right-0 z-0" />
    </main>
  )
}

export default LoadingGameData
