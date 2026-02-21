"use client"

import { type DialogProps } from "@radix-ui/react-dialog"
import { type ConstantValues } from "@repo/common"
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import VisuallyHidden from "@/components/ui/visually-hidden"
import { type MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { cn } from "@/utils"

export const AlertDialogBase = ({
  children,
  className,
  customClose,
  ...props
}: {
  alertDialog?: boolean
  className?: string
  customClose?: () => void
} & DialogProps) => {
  return (
    <AlertDialog open onOpenChange={customClose} {...props}>
      <AlertDialogContent className={cn("max-h-[80vh] overflow-y-auto", className)}>
        <VisuallyHidden>
          <AlertDialogTitle />
        </VisuallyHidden>
        {children}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const ModalBase = ({
  modalKey,
  children,
  className,
  customClose,
  title,
  description,
  ...props
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  modalKey: ConstantValues<typeof MODAL_KEYS>
  alertDialog?: boolean
  customClose?: () => void
  className?: string
} & DialogProps) => {
  const { closeModal } = useModal(modalKey)

  return (
    <Dialog open onOpenChange={customClose || closeModal} {...props}>
      <DialogContent className={cn("max-h-[80vh] overflow-y-auto p-4", className)}>
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
          <DialogDescription>
            {description && <span className="text-muted-foreground text-sm">{`This is the ${title} modal`}</span>}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export const LoadingModal = ({
  modalKey,
}: {
  modalKey: ConstantValues<typeof MODAL_KEYS>
}) => (
  <ModalBase {...{ modalKey }} alertDialog>
    <div className="flex flex-col items-center justify-center p-4" />
    <div className="loader mb-4" />
    <p className="text-center">Loading...</p>
  </ModalBase>
)
