"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { useMarkConversationReadMutation, useSendConversationMessageMutation, useSubscribeConversationMessagesQuery, useSubscribeConversationQuery } from "@/redux/api/conversations"
import { useGetUserByIdQuery } from "@/redux/api/user"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { cn } from "@/utils"

const formSchema = z.object({ content: z.string().min(1) })
type FormSchema = z.infer<typeof formSchema>

type SenderNameProps = {
  senderId: string
}

const SenderName = ({ senderId }: SenderNameProps) => {
  const { data: user } = useGetUserByIdQuery({ id: senderId }, { skip: !senderId })

  return <p className="text-xs text-muted-foreground mb-0.5 truncate">{user?.pseudo || user?.email || ""}</p>
}

type Props = {
  conversationId: string
}

export const ConversationThread = ({ conversationId }: Props) => {
  const uid = useAppSelector(selectUserId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: conversation } = useSubscribeConversationQuery({ conversationId }, { skip: !conversationId })
  const { data: messages = [] } = useSubscribeConversationMessagesQuery({ conversationId }, { skip: !conversationId })
  const [sendMessage, { isLoading }] = useSendConversationMessageMutation()
  const [markConversationRead] = useMarkConversationReadMutation()

  const showsSenders = Boolean(conversation?.lobbyId)

  const { handleSubmit, register, reset } = useForm<FormSchema>({
    defaultValues: { content: "" },
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!uid || !messages.length) return

    markConversationRead({ conversationId, uid })
  }, [messages, uid, conversationId, markConversationRead])

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
              message.senderId === uid ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground",
            )}
          >
            {showsSenders && message.senderId !== uid && <SenderName senderId={message.senderId} />}
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
