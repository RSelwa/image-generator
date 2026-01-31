import { Viewer } from "@photo-sphere-viewer/core"
import { getImageUrl } from "@repo/common"
import { useEffect, useRef } from "react"

export const SphericalViewer = ({ src }: { src: string }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const viewer = new Viewer({
      container: ref.current,
      panorama: getImageUrl(src),
    })

    return () => {
      viewer.destroy()
    }
  }, [src])

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />
}
