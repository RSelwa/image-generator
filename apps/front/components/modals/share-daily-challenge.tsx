import { type DailyChallengeEntity } from "@repo/schemas"
import { ArrowUpRightFromSquare, Flame } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageGlow } from "@/components/ui/image-glow"
import { PAGES } from "@/constants/pages"
import { Link } from "@/i18n/routing"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type Props = {
    challenge: DailyChallengeEntity
}

const ShareDailyChallengeModal = ({ challenge }: Props) => {
    const t = useTranslations("dailyChallenge")
    const locale = useLocale()
    const user = useAppSelector(selectUser)

    const shouldCreateAccount = user?.isAnonymous || !user

    const copyChallengeToClipboard = async () => {
        try {
            const url = `${window.location.origin}/${locale}${PAGES.DAILY_CHALLENGE_DATE(challenge.date)}`
            navigator.clipboard.writeText(url)

            toast.success(t("linkCopied"))
        } catch (error) {
            console.error("Failed to copy the challenge link:", error)
            toast.error(t("failedCopy"))
        }
    }

    return (
        <Dialog defaultOpen={true}>
            <DialogTrigger asChild className="absolute left-1/2 -translate-x-1/2 bottom-6"><Button>{t("shareResult")}</Button></DialogTrigger>
            <DialogContent data-testid="share-daily-challenge-modal">
                <ImageGlow radius={30} opacity={0.5} className="w-full object-cover max-h-96 max-w-[80vw]">
                    <Image data-testid="daily-challenge-result-thumbnail" src={challenge.gameThumbnailUrl} alt={`${challenge.gameTitle}`} height={500} width={1000} className="max-h-56 object-contain" />
                </ImageGlow>
                {!!user?.streak && user.streak > 0 && (
                    <div data-testid="streak-badge" className="flex items-center justify-center gap-2 text-orange-500 font-bold text-lg">
                        <Flame className="size-5" />
                        <span>{t("streak", { count: user.streak })}</span>
                    </div>
                )}
                <DialogTitle>{t("shareTitle")}</DialogTitle>
                <DialogDescription>{t("shareDescription", { gameTitle: challenge.gameTitle })}</DialogDescription>
                <DialogFooter className="justify-center!">
                    {shouldCreateAccount && (
                        <Link href={PAGES.SIGNUP}>
                            <Button variant="marathon-white">{t("createAccount")}</Button>
                        </Link>
                    )}
                    <Button onClick={copyChallengeToClipboard}>{t("shareButton")}<ArrowUpRightFromSquare /></Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ShareDailyChallengeModal
