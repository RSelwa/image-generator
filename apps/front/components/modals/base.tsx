"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import VisuallyHidden from "@/components/ui/visually-hidden"
import type { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import type { DialogProps } from "@radix-ui/react-dialog"
import type { ConstantValues } from "@repo/common"
import { XIcon } from "lucide-react"

type Props = {
  modalKey: ConstantValues<typeof MODAL_KEYS>
  alertDialog?: boolean
  customClose?: () => void
  className?: string
} & DialogProps

export const ModalBase = ({
  modalKey,
  children,
  alertDialog = false,
  className,
  customClose,
  ...props
}: Props) => {
  const { closeModal } = useModal(modalKey)

  return (
    <Dialog open onOpenChange={customClose || closeModal} {...props}>
      <DialogContent className={className}>
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>
        <section className="absolute top-2 px-2 z-50 flex justify-end w-full gap-2">
          <DialogClose asChild>
            <Button variant={"ghost"} className="size-8 bg-transparent p-0">
              <XIcon className="size-4" />
            </Button>
          </DialogClose>
        </section>
        {children}
      </DialogContent>
    </Dialog>
  )
}
