"use client"

import { ArrowUpRightFromSquareIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { IMAGES_URLS } from "@/constants/images"
import { LIMITED_MODAL_CONFIG, LIMITED_MODAL_KEYS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useLimitedModal } from "@/hooks/use-limited-modal"
import { Link } from "@/i18n/routing"

const modalKey = LIMITED_MODAL_KEYS.RACE_MODE
const maxCount = LIMITED_MODAL_CONFIG[modalKey].maxCount

export const RaceModePub = () => {
    const { shouldShow, incrementCounter } = useLimitedModal(modalKey, maxCount)
    const t = useTranslations("raceMode")

    return (
        <Dialog open={shouldShow} onOpenChange={incrementCounter}>
            <DialogContent className="p-0 lg:max-w-1/2">
                <Image src={IMAGES_URLS.PUBS.RACE_MODE} alt="Daily Challenge" width={2329} height={1262} className="object-cover max-h-96 w-full" />
                <DialogTitle className="px-6">
                    {t("title")}
                </DialogTitle>
                <DialogDescription className="px-6">
                    {t("description")}
                </DialogDescription>
                <DialogFooter className="m-0 justify-center!">
                    <Link href={PAGES.RACE} className="w-fit mx-auto">
                        <Button variant="marathon-black" data-umami-event="click-pub-race-mode">
                            {t("playNow")}
                            <ArrowUpRightFromSquareIcon />
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
