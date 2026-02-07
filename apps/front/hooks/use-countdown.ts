import { type Timestamp } from "@firebase/firestore"
import { useEffect, useState } from "react"

export const useCountdown = (startedAt: Timestamp | null | undefined, durationSeconds: number) => {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds)

  useEffect(() => {
    if (!startedAt) {
      setTimeRemaining(durationSeconds)

      return
    }

    const calcRemaining = () => {
      const elapsed = (Date.now() - startedAt.toMillis()) / 1000

      return Math.max(0, Math.ceil(durationSeconds - elapsed))
    }

    setTimeRemaining(calcRemaining())

    const interval = setInterval(() => {
      const value = calcRemaining()
      setTimeRemaining(value)
      if (value <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt, durationSeconds])

  const isExpired = timeRemaining <= 0

  return { timeRemaining, isExpired }
}
