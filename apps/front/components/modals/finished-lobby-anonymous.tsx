import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { IMAGES_URLS } from "@/constants/images"
import { PAGES } from "@/constants/pages"

const FinishedLobbyAnonymous = () => {
    return (
        <AlertDialog open={true}>
            <AlertDialogContent>
                <Image src={IMAGES_URLS.ANONYMOUS} alt="Anonymous" width={120} height={120} className="mx-auto mb-4 object-cover" />
                <AlertDialogTitle>
                    Thanks for playing the demo!
                </AlertDialogTitle>
                <AlertDialogDescription>
                    To access all features and play with your friends, please create an account. It's quick and easy!
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogAction asChild>
                        <Button asChild className="rounded-none w-full">
                            <Link href={PAGES.SIGNUP}>
                                Create an account
                            </Link>
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default FinishedLobbyAnonymous
