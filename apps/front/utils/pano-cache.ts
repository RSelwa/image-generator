const panoCache = new Map<string, string>() // id -> blobUrl
const pendingRequests = new Map<string, Promise<string>>() // id -> promise

const buildProxyUrl = (imageUrl: string) =>
  `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`

export const preloadImage = (id: string, imageUrl: string): Promise<string> => {
  const cached = panoCache.get(id)
  if (cached) return Promise.resolve(cached)

  const pending = pendingRequests.get(id)
  if (pending) return pending

  const promise = fetch(buildProxyUrl(imageUrl))
    .then(res => res.blob())
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
