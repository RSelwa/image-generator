"use client"

import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin"
import { type Viewer } from "@photo-sphere-viewer/core"
import { useParams } from "next/navigation"
import { useCallback, useState } from "react"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

const AUTOROTATE_SPEED = "3rpm"
const READY_DELAY_MS = 1000

const PromoPage = () => {
  const { sphericalId } = useParams<{ sphericalId: string }>()
  const [ready, setReady] = useState(false)

  const handleReady = useCallback((instance: Viewer) => {
    const autorotate = instance.getPlugin(AutorotatePlugin)
    if (autorotate) {
      autorotate?.start()
    }

    setTimeout(() => setReady(true), READY_DELAY_MS)
  }, [])

  const src = `/api/proxy-image?url=${encodeURIComponent(sphericalId)}`

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-black"
      data-testid="promo-container"
      data-ready={ready}
    >
      <ReactPhotoSphereViewer
        src={src}
        height="100%"
        width="100%"
        hideNavbarButton
        navbar={false}
        plugins={[
          [AutorotatePlugin, {
            autostartDelay: 0,
            autostartOnIdle: true,
            autorotateSpeed: AUTOROTATE_SPEED,
          }],
        ]}
        onReady={handleReady}
      />
    </div>
  )
}

export default PromoPage
