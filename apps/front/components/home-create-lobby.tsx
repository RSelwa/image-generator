"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { useCreateAndJoinLobbyMutation } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const CreateLobbyButton = () => {
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const [createLobbyDoc, { isLoading }] = useCreateAndJoinLobbyMutation()

  if (!user) {
    return (
      <Button disabled>
        Start Playing
      </Button>
    )
  }

  const handleCreateLobby = async () => {
    try {
      const lobby = await createLobbyDoc({ user }).unwrap()

      router.push(`${PAGES.LOBBY}/${lobby.id}`)
    } catch (error) {
      console.error("Failed to create lobby:", error)
    }
  }

  return (
    <Button data-testid="create-lobby-button" onClick={handleCreateLobby} disabled={isLoading}>
      Play now!
      {" "}
      {isLoading && <Loader className="size-4" />}
    </Button>
  )
}

export default CreateLobbyButton
