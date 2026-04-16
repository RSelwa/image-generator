const panoCache = new Map<string, string>() // id -> blobUrl
const pendingRequests = new Map<string, Promise<string>>() // id -> promise

const MOBILE_MAX_TEXTURE_WIDTH = 2048

const buildProxyUrl = (imageUrl: string) =>
  `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`

const isMobileDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

const downscaleBlob = (blob: Blob, maxWidth: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      URL.revokeObjectURL(url)

      if (img.width <= maxWidth) {
        resolve(blob)
        return
      }

      const canvas = document.createElement("canvas")
      canvas.width = maxWidth
      canvas.height = Math.round(img.height * (maxWidth / img.width))

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(blob)
        return
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        result => (result ? resolve(result) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        0.85,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Image load failed"))
    }

    img.src = url
  })

export const preloadImage = (id: string, imageUrl: string): Promise<string> => {
  const cached = panoCache.get(id)
  if (cached) return Promise.resolve(cached)

  const pending = pendingRequests.get(id)
  if (pending) return pending

  const promise = fetch(buildProxyUrl(imageUrl))
    .then(res => res.blob())
    .then(blob => isMobileDevice() ? downscaleBlob(blob, MOBILE_MAX_TEXTURE_WIDTH) : blob)
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob)
      panoCache.set(id, blobUrl)
      pendingRequests.delete(id)
      return blobUrl
    })
    .catch(err => {
      pendingRequests.delete(id)
      throw err
    })

  pendingRequests.set(id, promise)
  return promise
}

export const getCachedImage = (id: string): string | null =>
  panoCache.get(id) || null

export const clearPanoCache = () => {
  panoCache.forEach(blobUrl => URL.revokeObjectURL(blobUrl))
  panoCache.clear()
  pendingRequests.clear()
}
