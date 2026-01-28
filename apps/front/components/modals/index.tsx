"use client"

import {
  SphericalGalleryModal,
  SphericalModal,
} from "@/components/modals/spherical-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import VisuallyHidden from "@/components/ui/visually-hidden"
import { MODAL_KEYS, MODAL_TYPES_VALUES } from "@/constants/mapping"
import { XIcon } from "lucide-react"
import { useQueryState } from "nuqs"

const ModalContent = () => {
  const [modalType] = useQueryState(MODAL_KEYS.MODAL_TYPE)

  if (modalType === MODAL_TYPES_VALUES.SPHERICAL) return <SphericalModal />
  if (modalType === MODAL_TYPES_VALUES.SPHERICAL_GALLERY)
    return <SphericalGalleryModal />

  return null
}

export const Modals = () => {
  const [modalType, setModalType] = useQueryState(MODAL_KEYS.MODAL_TYPE)
  const open = Boolean(modalType)

  const toggleQueryParam = (isOpen: boolean) => {
    if (!isOpen) setModalType(null)
  }

  return (
    <Dialog open={open} onOpenChange={toggleQueryParam}>
      <DialogContent>
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>
        <section className="absolute top-2 px-2 z-50 flex justify-end w-full gap-2">
          <Button
            variant={"ghost"}
            className="size-8 bg-transparent p-0"
            onClick={() => toggleQueryParam(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </section>
        <ModalContent />
      </DialogContent>
    </Dialog>
  )
}
