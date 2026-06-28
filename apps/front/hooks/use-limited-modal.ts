"use client"

import { useState } from "react"
import { IS_PLAYWRIGHT_EMULATOR } from "@/constants/mapping"
import { useLocalStorage, useSessionStorage } from "@/hooks/use-storage"

export const useLimitedModal = (key: string, maxCount: number) => {
  const [count, setCount] = useLocalStorage<number>(key, 0)

  const shouldShow = !IS_PLAYWRIGHT_EMULATOR && count < maxCount
  const [isOpen, setIsOpen] = useState(shouldShow)

  const close = () => {
    setIsOpen(false)
    setCount(count + 1)
  }

  return { isOpen, close }
}

// Same as useLimitedModal but the count lives in sessionStorage:
// resets every new browser session (max maxCount shows per session).
export const useSessionLimitedModal = (key: string, maxCount: number) => {
  const [count, setCount] = useSessionStorage<number>(key, 0)

  const shouldShow = !IS_PLAYWRIGHT_EMULATOR && count < maxCount
  const [isOpen, setIsOpen] = useState(shouldShow)

  const close = () => {
    setIsOpen(false)
    setCount(count + 1)
  }

  return { isOpen, close }
}
