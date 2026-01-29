"use client"

import {
  SphericalGalleryModal,
  SphericalModal,
} from "@/components/modals/spherical-modal"
import { MODAL_KEYS } from "@/constants/mapping"
import { useSearchParams } from "next/navigation"

export const ModalProvider = () => {
  const searchParams = useSearchParams()

  const type = Object.values(MODAL_KEYS).find((key) => searchParams.has(key))


  if (type === MODAL_KEYS.SPHERICAL_ID) return <SphericalModal />
  if (type === MODAL_KEYS.SPHERICAL_GALLERY_ID) return <SphericalGalleryModal />

  return null
}
