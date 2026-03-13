"use client"

import { ArrowUpRightFromSquareIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { IMAGES_URLS } from "@/constants/images"
import { LIMITED_MODAL_CONFIG, LIMITED_MODAL_KEYS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useLimitedModal } from "@/hooks/use-limited-modal"

const modalKey = LIMITED_MODAL_KEYS.DAILY_CHALLENGE
const maxCount = LIMITED_MODAL_CONFIG[modalKey].maxCount

const DailyChallengePub = () => {
    const { shouldShow, incrementCounter } = useLimitedModal(modalKey, maxCount)

    return (
        <Dialog defaultOpen={shouldShow} onOpenChange={incrementCounter}>
            <DialogContent className="p-0 lg:max-w-1/2">
                <Image src={IMAGES_URLS.PUBS.DAILY_CHALLENGE} alt="Daily Challenge" width={2329} height={1262} className="object-cover max-h-96 w-full" />
                <DialogTitle className="px-6">
                    Discover
                    daily challenges and compete with the world
                </DialogTitle>
                <DialogDescription className="px-6">
                    Every day, a new challenge is generated and available for all players. Compete with your friends and the world to reach the best streak!
                </DialogDescription>
                <DialogFooter className="m-0 justify-center!">
                    <Link href={PAGES.DAILY_CHALLENGE} className="w-fit mx-auto">
                        <Button variant="marathon-black">
                            Discover daily challenges
                            <ArrowUpRightFromSquareIcon />
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DailyChallengePub
