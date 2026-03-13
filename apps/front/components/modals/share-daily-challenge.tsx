import { type DailyChallengeEntity } from "@repo/schemas"
import { ArrowUpRightFromSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageGlow } from "@/components/ui/image-glow"
import { PAGES } from "@/constants/pages"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

type Props = {
    challenge: DailyChallengeEntity
}

const ShareDailyChallengeModal = ({ challenge }: Props) => {
    const user = useAppSelector(selectUser)

    const shouldCreateAccount = user?.isAnonymous || !user

    const copyChallengeToClipboard = async () => {
        try {
            const url = `${window.location.origin}${PAGES.DAILY_CHALLENGE_DATE(challenge.date)}`
            navigator.clipboard.writeText(url)

            toast.success("Challenge link copied to clipboard!")
        } catch (error) {
            console.error("Failed to copy the challenge link:", error)
            toast.error("Failed to copy the challenge link. Please try again.")
        }
    }

    return (
        <Dialog defaultOpen={true}>
            <DialogTrigger asChild className="absolute left-1/2 -translate-x-1/2 bottom-6"><Button>Result</Button></DialogTrigger>
            <DialogContent data-testid="share-daily-challenge-modal">
                <ImageGlow radius={30} opacity={0.5} className="w-full object-cover max-h-96">
                    <Image data-testid="daily-challenge-result-thumbnail" src={challenge.gameThumbnailUrl} alt={`${challenge.gameTitle}`} height={500} width={1000} className="max-h-56 object-contain" />
                </ImageGlow>
                <DialogTitle>Share this challenge to your friends</DialogTitle>
                <DialogDescription>Thanks for playing this challenge. You discover {challenge.gameTitle}</DialogDescription>
                <DialogFooter className="justify-center!">
                    {shouldCreateAccount && (
                        <Link href={PAGES.SIGNUP}>
                            <Button variant="marathon-white">Create an account</Button>
                        </Link>
                    )}
                    <Button onClick={copyChallengeToClipboard}>Share this challenge to friends<ArrowUpRightFromSquare /></Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ShareDailyChallengeModal
