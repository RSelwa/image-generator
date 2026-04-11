"use client"

declare global {
  interface Window {
    adBreak?: (config: AdBreakConfig) => void
    adConfig?: (config: Record<string, unknown>) => void
    adsbygoogle?: unknown[]
  }
}

type AdBreakConfig = {
  type: "reward"
  name: string
  beforeAd?: () => void
  afterAd?: () => void
  adDismissed?: () => void
  adViewed?: () => void
}

export const useRewardedAd = () => {
  const showAd = ({
    name,
    onRewarded,
    onDismissed,
  }: {
    name: string
    onRewarded: () => void
    onDismissed: () => void
  }) => {
    if (typeof window === "undefined" || !window.adBreak) {
      onRewarded()

      return
    }

    window.adBreak({
      type: "reward",
      name,
      adViewed: onRewarded,
      adDismissed: onDismissed,
    })
  }

  return { showAd }
}
