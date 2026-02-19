import Image from "next/image"
import { useQueryState } from "nuqs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useGetUserByIdQuery } from "@/redux/api/user"
import { EmptySheet } from "@/components/sheet/empty"
import { getAvatarUrl } from "@/utils/file"

const SheetAdminUser = () => {
    const [userId, setUserId] = useQueryState(QUERY_PARAMS.USER_ID)

    const { data: user } = useGetUserByIdQuery({ id: userId || "" }, { skip: !userId })

    const open = Boolean(userId)

    if (!user) return <Sheet open={open} onOpenChange={(open) => !open && setUserId(null)}><EmptySheet /></Sheet>

    const avatar = user.avatar ? getAvatarUrl(user.avatar) : ""

    return (
        <Sheet open={open} onOpenChange={(open) => !open && setUserId(null)}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{user.email}</SheetTitle>
                    <SheetDescription>Id of the suggestion {user.id}</SheetDescription>
                </SheetHeader>
                <section className="grid flex-1 md:grid-cols-2 grid-cols-1 auto-rows-min gap-6 px-4">
                    <Image key={avatar} src={avatar} alt={`Avatar of ${user.email}`} width={370} height={370} />
                </section>
            </SheetContent>
        </Sheet>
    )
}

export default SheetAdminUser