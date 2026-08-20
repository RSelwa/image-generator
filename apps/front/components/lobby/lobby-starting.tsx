import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ASSET_URLS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { SELECTORS } from "@/constants/testing"
import { Link } from "@/i18n/routing"

const PROGRESS_STEP = 2
const PROGRESS_INTERVAL_MS = 110
// startLobby writes STARTING before the seed and round work; if that work fails it
// only toasts, and its own status guard then blocks any retry. Give the player a way out.
const STALL_TIMEOUT_MS = 20_000

const LobbyStarting = () => {
  const t = useTranslations("lobby")

  const [progress, setProgress] = useState(0)
  const [isStalled, setIsStalled] = useState(false)

  useEffect(() => {
    let current = 0

    const interval = setInterval(() => {
      current += PROGRESS_STEP
      setProgress(current)
      if (current >= 100) clearInterval(interval)
    }, PROGRESS_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setIsStalled(true), STALL_TIMEOUT_MS)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <main className="min-h-full-height relative flex flex-col items-center justify-center gap-6 bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute top-0 left-0 z-0 rotate-180" />
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute bottom-0 right-0 z-0" />
      <Progress className="w-1/2 h-15 z-10" value={progress} />
      {isStalled && (
        <div data-testid={SELECTORS.LOBBY_STARTING_STALLED} className="z-10 flex flex-col items-center gap-4">
          <p className="text-primary text-center">{t("startingStalled")}</p>
          <Button variant="marathon-outline" asChild>
            <Link href={PAGES.HOME}>{t("backToHome")}</Link>
          </Button>
        </div>
      )}
    </main>
  )
}

export default LobbyStarting
