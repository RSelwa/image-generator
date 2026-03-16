import { XIcon } from "lucide-react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import * as React from "react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { IMAGES_URLS } from "@/constants/images"
import { PAGES } from "@/constants/pages"

const FinishedLobbyAnonymous = () => {
    const t = useTranslations("finishedLobbyAnonymous")

    return (
        <AlertDialog open={true}>
            <AlertDialogContent data-testid="finished-lobby-anonymous-modal" className="pt-0 px-0 rounded-none">
                <Image src={IMAGES_URLS.ANONYMOUS} alt="Anonymous" width={120} height={120} className="w-full max-h-64 mb-4 object-cover" />
                <AlertDialogCancel asChild>
                    <Button variant="ghost" className="rounded-none text-foreground absolute right-0 top-0">
                        <XIcon className="" />
                    </Button>
                </AlertDialogCancel>
                <div className="grid px-6 gap-4">
                    <AlertDialogTitle>
                        {t("title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("description")}
                    </AlertDialogDescription>
                    <AlertDialogFooter className="flex gap-2">
                        <Button asChild className="rounded-none flex-1">
                            <Link href={PAGES.SIGNUP}>
                                {t("createAccount")}
                            </Link>
                        </Button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default FinishedLobbyAnonymous
