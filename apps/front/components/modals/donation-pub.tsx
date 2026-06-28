"use client"

import { CoffeeIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { IMAGES_URLS } from "@/constants/images"
import { LIMITED_MODAL_CONFIG, LIMITED_MODAL_KEYS } from "@/constants/mapping"
import { BUY_ME_A_COFFEE_LINK } from "@/constants/social"
import { useLimitedModal } from "@/hooks/use-limited-modal"

const modalKey = LIMITED_MODAL_KEYS.DONATION
const maxCount = LIMITED_MODAL_CONFIG[modalKey].maxCount

export const DonationPub = () => {
  const { isOpen, close } = useLimitedModal(modalKey, maxCount)
  const t = useTranslations("donation")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="p-0 lg:max-w-1/2">
        <Image src={IMAGES_URLS.PUBS.DONATION} alt="Support the project" width={2329} height={1262} className="object-cover max-h-96 w-full" />
        <DialogTitle className="px-6">
          {t("title")}
        </DialogTitle>
        <DialogDescription className="px-6">
          {t("description")}
        </DialogDescription>
        <DialogFooter className="m-0 justify-center!">
          <a href={BUY_ME_A_COFFEE_LINK} target="_blank" rel="noopener noreferrer" className="w-fit mx-auto">
            <Button variant="marathon-black" data-umami-event="click-pub-donation" onClick={close}>
              {t("support")}
              <CoffeeIcon />
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
