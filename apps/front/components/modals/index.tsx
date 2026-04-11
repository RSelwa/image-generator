"use client"

import { useSearchParams } from "next/navigation"
import ChangePseudoModal from "@/components/modals/change-pseudo"
import { ModalFlatId } from "@/components/modals/flat-id"
import { FlatsGallery } from "@/components/modals/flats-gallery"
import { ModalGame } from "@/components/modals/game"
import { JoinLobbyModal } from "@/components/modals/join-lobby"
import { MakeSuggestion } from "@/components/modals/make-suggestion"
import { ModalMapId } from "@/components/modals/map-id"
import { MapsGallery } from "@/components/modals/maps-gallery"
import NewDailyChallenge from "@/components/modals/new-daily-challenge"
import NewSocial from "@/components/modals/new-social"
import NewSound from "@/components/modals/new-sound"
import { ReportBugModal } from "@/components/modals/report-bug"
import { SeedDetailModal } from "@/components/modals/seed-detail"
import { SphericalGalleryModal } from "@/components/modals/spherical-gallery"
import { ModalSphericalId } from "@/components/modals/spherical-id"
import { SuggestGameModal } from "@/components/modals/suggest-game"
import { MODAL_KEYS } from "@/constants/mapping"

export const ModalProvider = () => {
  const searchParams = useSearchParams()

  const type = Object.values(MODAL_KEYS).find((key) => searchParams.has(key))

  if (type === MODAL_KEYS.CHANGE_PSEUDO) return <ChangePseudoModal />
  if (type === MODAL_KEYS.JOIN_LOBBY) return <JoinLobbyModal />

  if (type === MODAL_KEYS.NEW_SOUND) return <NewSound />
  if (type === MODAL_KEYS.NEW_SOCIALS) return <NewSocial />
  if (type === MODAL_KEYS.NEW_DAILY_CHALLENGE) return <NewDailyChallenge />
  if (type === MODAL_KEYS.MAKE_SUGGESTION) return <MakeSuggestion />
  if (type === MODAL_KEYS.REPORT_BUG) return <ReportBugModal />
  if (type === MODAL_KEYS.SUGGEST_GAME) return <SuggestGameModal />

  if (type === MODAL_KEYS.GAME_ID) return <ModalGame />
  if (type === MODAL_KEYS.SPHERICAL_GALLERY_ID)
    return <SphericalGalleryModal />
  if (type === MODAL_KEYS.EDIT_SPHERICAL_ID) return <ModalSphericalId />

  if (type === MODAL_KEYS.MAPS_GALLERY_ID) return <MapsGallery />
  if (type === MODAL_KEYS.MAP_ID) return <ModalMapId />

  if (type === MODAL_KEYS.FLAT_GALLERY_ID) return <FlatsGallery />
  if (type === MODAL_KEYS.FLAT_ID) return <ModalFlatId />

  if (type === MODAL_KEYS.SEED_DETAIL) return <SeedDetailModal />

  return null
}
