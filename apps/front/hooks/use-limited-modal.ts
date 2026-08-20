"use client"

import { useEffect, useState } from "react"
import { IS_PLAYWRIGHT_EMULATOR } from "@/constants/mapping"
import { useLocalStorage, useSessionStorage } from "@/hooks/use-storage"

export const useLimitedModal = (key: string, maxCount: number) => {
  const [count, setCount] = useLocalStorage<number>(key, 0)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // The stored count is only readable after hydration: the server snapshot is
  // always the default, so opening before then ignores the cap.
  const isOpen = isHydrated && !isDismissed && !IS_PLAYWRIGHT_EMULATOR && count < maxCount

  const close = () => {
    setIsDismissed(true)
    setCount(count + 1)
  }

  return { isOpen, close }
}

// Same as useLimitedModal but the count lives in sessionStorage:
// resets every new browser session (max maxCount shows per session).
export const useSessionLimitedModal = (key: string, maxCount: number) => {
  const [count, setCount] = useSessionStorage<number>(key, 0)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // The stored count is only readable after hydration: the server snapshot is
  // always the default, so opening before then ignores the cap.
  const isOpen = isHydrated && !isDismissed && !IS_PLAYWRIGHT_EMULATOR && count < maxCount

  const close = () => {
    setIsDismissed(true)
    setCount(count + 1)
  }

  return { isOpen, close }
}
