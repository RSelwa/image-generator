import * as React from "react"
import LobbyMain from "@/components/lobby/lobby-main"

const Page = async ({
  params,
}: {
  params: Promise<{ lobbyId: string }>
}) => {
  const { lobbyId } = await params

  return (
    <LobbyMain lobbyId={lobbyId} />
  )
}

export default Page
