"use client"

import { type Viewer } from "@photo-sphere-viewer/core"
import { useSearchParams } from "next/navigation"
import { useCallback, useRef } from "react"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

declare global {
  interface Window {
    sceneReady: boolean
    setCamera: (yaw: number, pitch: number) => void
    setZoom: (level: number) => void
    viewer: Viewer | null
  }
}

const CapturePage = () => {
  const searchParams = useSearchParams()
  const imageUrl = searchParams.get("image")
  const viewerRef = useRef<Viewer | null>(null)

  const handleReady = useCallback((instance: Viewer) => {
    console.info("Viewer onReady triggered")
    viewerRef.current = instance
    window.viewer = instance
    window.sceneReady = true

    // Expose setCamera and setZoom for Playwright control
    window.setCamera = (yaw: number, pitch: number) => {
      instance.rotate({
        yaw,
        pitch,
      })
    }

    window.setZoom = (level: number) => {
      instance.zoom(level)
    }

    console.info("Capture page ready - window.sceneReady =", window.sceneReady)
  }, [])

  if (!imageUrl) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <p>Missing image URL parameter. Use ?image=URL</p>
      </div>
    )
  }

  const src = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`

  console.info("Loading capture page with image:", imageUrl)
  console.info("Proxy URL:", src)

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-black"
      data-testid="capture-container"
    >
      <ReactPhotoSphereViewer
        src={src}
        height="100%"
        width="100%"
        hideNavbarButton
        navbar={false}
        onReady={handleReady}
      />
    </div>
  )
}

export default CapturePage
