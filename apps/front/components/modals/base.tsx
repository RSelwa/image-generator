"use client"

import { type DialogProps } from "@radix-ui/react-dialog"
import { type ConstantValues } from "@repo/common"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import VisuallyHidden from "@/components/ui/visually-hidden"
import { type MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { cn } from "@/lib/utils"

type Props = {
  modalKey: ConstantValues<typeof MODAL_KEYS>
  alertDialog?: boolean
  customClose?: () => void
  className?: string
} & DialogProps

export function ModalBase({
  modalKey,
  children,
  className,
  customClose,
  ...props
}: Props) {
  const { closeModal } = useModal(modalKey)

  return (
    <Dialog open onOpenChange={customClose || closeModal} {...props}>
      <DialogContent className={cn("max-h-[80vh] overflow-y-auto", className)}>
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>
        <section className="absolute top-2 px-2 z-50 flex justify-end w-full gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="size-8 bg-transparent p-0">
              <XIcon className="size-4" />
            </Button>
          </DialogClose>
        </section>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function LoadingModal({
  modalKey,
}: {
  modalKey: ConstantValues<typeof MODAL_KEYS>
}) {
  return (
    <ModalBase {...{ modalKey }} alertDialog>
      <div className="flex flex-col items-center justify-center p-4" />
      <div className="loader mb-4" />
      <p className="text-center">Loading...</p>
    </ModalBase>
  )
}
