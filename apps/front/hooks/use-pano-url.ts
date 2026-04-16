"use client"

import { useEffect, useState } from "react"
import { getCachedImage, preloadImage } from "@/utils/pano-cache"

export const usePanoUrl = (
  id: string | null | undefined,
  imageUrl: string | null | undefined,
): string | null => {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!id || !imageUrl || getCachedImage(id)) return

    preloadImage(id, imageUrl)
      .then(() => forceUpdate(n => n + 1))
      .catch(console.error)
  }, [id, imageUrl])

  return id ? getCachedImage(id) : null
}
