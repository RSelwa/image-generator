import { useQueryState } from "nuqs"
import { EmptySheet } from "@/components/sheet/empty"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { UserAvatar } from "@/components/ui/user-avatar"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useGetUserByIdQuery } from "@/redux/api/user"

const SheetAdminUser = () => {
    const [userId, setUserId] = useQueryState(QUERY_PARAMS.USER_ID)

    const { data: user } = useGetUserByIdQuery({ id: userId || "" }, { skip: !userId })

    const open = Boolean(userId)

    if (!user) return <Sheet open={open} onOpenChange={(open) => !open && setUserId(null)}><EmptySheet /></Sheet>

    return (
        <Sheet open={open} onOpenChange={(open) => !open && setUserId(null)}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{user.email}</SheetTitle>
                    <SheetDescription>Id of the suggestion {user.id}</SheetDescription>
                </SheetHeader>
                <section className="grid flex-1 md:grid-cols-2 grid-cols-1 auto-rows-min gap-6 px-4">
                    <UserAvatar avatar={user.avatar || undefined} name={user.email || user.id} donorTier={user.donorTier} className="size-20" />
                </section>
            </SheetContent>
        </Sheet>
    )
}

export default SheetAdminUser