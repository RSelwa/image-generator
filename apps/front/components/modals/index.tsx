"use client"

import { useSearchParams } from "next/navigation"
import { ModalGame } from "@/components/modals/game"
import { ModalMapId } from "@/components/modals/map-id"
import { MapsGallery } from "@/components/modals/maps-gallery"
import { SphericalGalleryModal } from "@/components/modals/spherical-gallery"
import { ModalSphericalId } from "@/components/modals/spherical-id"
import { MODAL_KEYS } from "@/constants/mapping"

export const ModalProvider = () => {
  const searchParams = useSearchParams()

  const type = Object.values(MODAL_KEYS).find((key) => searchParams.has(key))

  if (type === MODAL_KEYS.GAME_ID) return <ModalGame />
  if (type === MODAL_KEYS.SPHERICAL_ID) return <ModalSphericalId />
  if (type === MODAL_KEYS.SPHERICAL_GALLERY_ID)
    return <SphericalGalleryModal />
  if (type === MODAL_KEYS.MAP_ID) return <ModalMapId />
  if (type === MODAL_KEYS.MAPS_GALLERY_ID) return <MapsGallery />

  return null
}
