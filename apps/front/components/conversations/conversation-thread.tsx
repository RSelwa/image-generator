"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { useMarkConversationMessageSeenMutation, useSendConversationMessageMutation, useSubscribeConversationMessagesQuery } from "@/redux/api/conversations"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"

const formSchema = z.object({ content: z.string().min(1) })
type FormSchema = z.infer<typeof formSchema>

type Props = {
  conversationId: string
}

export const ConversationThread = ({ conversationId }: Props) => {
  const uid = useAppSelector(selectUserId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useSubscribeConversationMessagesQuery({ conversationId }, { skip: !conversationId })
  const [sendMessage, { isLoading }] = useSendConversationMessageMutation()
  const [markSeen] = useMarkConversationMessageSeenMutation()

  const { handleSubmit, register, reset } = useForm<FormSchema>({
    defaultValues: { content: "" },
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!uid || !messages.length) return

    for (const message of messages) {
      if (message.senderId !== uid && !message.seenBy.includes(uid)) {
        markSeen({ conversationId, messageId: message.id, uid })
      }
    }
  }, [messages, uid, conversationId, markSeen])

  const onSubmit = async ({ content }: FormSchema) => {
    if (!uid) return

    try {
      await sendMessage({ conversationId, content, senderId: uid }).unwrap()
      reset()
    } catch {
      toast.error("Erreur lors de l'envoi du message")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">Aucun message pour le moment</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[80%] rounded-lg px-3 py-2 text-sm",
              message.senderId === uid
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {message.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 p-2 border-t">
        <InputGroup className="flex-1">
          <InputGroupTextarea
            placeholder="Écrire un message..."
            className="resize-none min-h-[40px] max-h-[120px]"
            {...register("content")}
          />
        </InputGroup>
        <Button type="submit" disabled={isLoading || !uid} size="sm" className="self-end">
          {isLoading ? <Loader /> : "Envoyer"}
        </Button>
      </form>
    </div>
  )
}
