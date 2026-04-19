"use client"

import { useState } from "react"
import { IS_PLAYWRIGHT_EMULATOR } from "@/constants/mapping"
import { useLocalStorage } from "@/hooks/use-storage"

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
