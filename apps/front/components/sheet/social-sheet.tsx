import { SOCIALS_STATUS_WORDING } from "@repo/common"
import { RefreshCcw } from "lucide-react"
import { useQueryState } from "nuqs"
import * as React from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import { EmptySheet } from "@/components/sheet/empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getSocialRef } from "@/constants/db-refs"
import { QUERY_PARAMS } from "@/constants/mapping"
import { SOCIALS_STATUS_TO_BADGE_VARIANT } from "@/constants/social"
import { useGetSocialByIdQuery, useRetriggerPostProductionMutation } from "@/redux/api/socials"

const SocialSheet = () => {
    const [socialId, setSocialId] = useQueryState(QUERY_PARAMS.SOCIAL_ID)
    const open = Boolean(socialId)

    const [retriggerPostProduction] = useRetriggerPostProductionMutation()
    const { data: social } = useGetSocialByIdQuery({ id: socialId || "" }, { skip: !socialId })

    if (!social || !socialId) return <Sheet open={open} onOpenChange={(open) => !open && setSocialId(null)}><EmptySheet /></Sheet>

    const close = async (open: boolean) => {
        if (open) return

        setSocialId(null)
    }

    return (
        <Sheet open={open} onOpenChange={close}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{social.id} <OpenFirestoreDoc docRef={getSocialRef(socialId)} /></SheetTitle>
                    {social.status && (
                        <SheetDescription asChild>
                            <Badge variant={SOCIALS_STATUS_TO_BADGE_VARIANT[social.status]}>
                                {SOCIALS_STATUS_WORDING[social.status]}
                            </Badge>
                        </SheetDescription>
                    )}
                </SheetHeader>
                <ScrollArea className="h-5/6 space-y-2">
                    {social.errorInfo && (
                        <section className="bg-destructive text-destructive-foreground px-4 mx-4">
                            {social.errorInfo}
                        </section>
                    )}
                    <section className="grid grid-cols-2 gap-2 px-2">
                        <article className="relative">
                            {social.urlCustomizedVideoStorage && (
                                <>

                                    <video controls autoPlay className="w-full h-auto">
                                        <source src={social.urlCustomizedVideoStorage} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="absolute top-2 left-2 flex items-center gap-1">
                                        <Badge>Customized</Badge>
                                        <Button size="icon" onClick={() => retriggerPostProduction({ id: socialId })}>
                                            <RefreshCcw className="size-4" />
                                        </Button>
                                    </div>
                                </>

                            )}
                        </article>
                        <article className="relative">
                            {social.urlSphericalVideoStorage && (
                                <>
                                    <Badge className="absolute top-2 left-2">Raw capture</Badge>
                                    <video controls autoPlay className="w-full h-auto">
                                        <source src={social.urlSphericalVideoStorage} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </>
                            )}
                        </article>
                    </section>
                </ScrollArea>

                <SheetFooter />
            </SheetContent>

        </Sheet>
    )
}

export default SocialSheet
