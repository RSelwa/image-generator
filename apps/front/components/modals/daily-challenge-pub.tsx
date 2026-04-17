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

const modalKey = LIMITED_MODAL_KEYS.DAILY_CHALLENGE
const maxCount = LIMITED_MODAL_CONFIG[modalKey].maxCount

const DailyChallengePub = () => {
    const { shouldShow, incrementCounter } = useLimitedModal(modalKey, maxCount)
    const t = useTranslations("dailyChallenge")

    return (
        <Dialog open={shouldShow} onOpenChange={incrementCounter}>
            <DialogContent className="p-0 lg:max-w-1/2">
                <Image src={IMAGES_URLS.PUBS.DAILY_CHALLENGE} alt="Daily Challenge" width={2329} height={1262} className="object-cover max-h-96 w-full" />
                <DialogTitle className="px-6">
                    {t("pubTitle")}
                </DialogTitle>
                <DialogDescription className="px-6">
                    {t("pubDescription")}
                </DialogDescription>
                <DialogFooter className="m-0 justify-center!">
                    <Link href={PAGES.DAILY_CHALLENGE} className="w-fit mx-auto">
                        <Button variant="marathon-black" data-umami-event="click-pub-daily-challenge">
                            {t("pubCta")}
                            <ArrowUpRightFromSquareIcon />
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DailyChallengePub
