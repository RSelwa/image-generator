"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PAGES } from "@/constants/pages"
import { useCreateAndJoinLobbyMutation, useCreateDemoLobbyMutation } from "@/redux/api/lobby"
import { selectIsAnonymous, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { ReactNode } from "react"

const CreateLobbyButton = ({children}: {children?: ReactNode}) => {
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const userIsAnonymous = useAppSelector(selectIsAnonymous)
  const [createLobbyDoc, { isLoading }] = useCreateAndJoinLobbyMutation()
  const [createDemoLobby] = useCreateDemoLobbyMutation()

  if (!user) return <Skeleton className="h-9 bg-primary w-24" />

  const handleCreateLobby = async () => {
    try {
      const lobby = userIsAnonymous ? await createDemoLobby({user}).unwrap() :  await createLobbyDoc({ user }).unwrap()

      router.push(`${PAGES.LOBBY}/${lobby.id}`)
    } catch (error) {
      console.error("Failed to create lobby:", error)
    }
  }

  return (
    <Button data-testid={user.isAnonymous ? "create-lobby-button-demo" : "create-lobby-button"} onClick={handleCreateLobby} disabled={isLoading}>
      {children||"Play now!"}
      {" "}
      {isLoading && <Loader className="size-4" />}
    </Button>
  )
}

export default CreateLobbyButton
