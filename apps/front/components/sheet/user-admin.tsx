"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryState } from "nuqs"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import Loader from "@/components/icons/loader"
import { EmptySheet } from "@/components/sheet/empty"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { UserAvatar } from "@/components/ui/user-avatar"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useCreateMessageMutation } from "@/redux/api/messages"
import { useGetUserByIdQuery } from "@/redux/api/user"

const formSchema = z.object({
    content: z.string().min(1),
})
type FormSchema = z.infer<typeof formSchema>

const SheetAdminUser = () => {
    const [userId, setUserId] = useQueryState(QUERY_PARAMS.USER_ID)

    const { data: user } = useGetUserByIdQuery({ id: userId || "" }, { skip: !userId })
    const [createMessage, { isLoading }] = useCreateMessageMutation()

    const open = Boolean(userId)

    const { handleSubmit, register, reset } = useForm<FormSchema>({
        defaultValues: { content: "" },
        resolver: zodResolver(formSchema),
    })

    const onSubmit = async (data: FormSchema) => {
        if (!userId) return

        try {
            await createMessage({
                content: data.content,
                targetType: "user",
                targetId: userId,
            }).unwrap()

            toast.success("Message envoyé")
            reset()
        } catch {
            toast.error("Erreur lors de l'envoi du message")
        }
    }

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
                <section className="px-4 space-y-2">
                    <h3 className="font-semibold text-sm">Envoyer un message</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                        <InputGroup>
                            <InputGroupTextarea
                                placeholder="Message pour le joueur..."
                                {...register("content")}
                            />
                        </InputGroup>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            Envoyer {isLoading && <Loader />}
                        </Button>
                    </form>
                </section>
            </SheetContent>
        </Sheet>
    )
}

export default SheetAdminUser
