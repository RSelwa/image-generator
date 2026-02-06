import * as React from "react"
import LobbyMain, { LobbyDebug } from "@/components/lobby/lobby-main"

const Page = async ({
  params,
}: {
  params: Promise<{ lobbyId: string }>
}) => {
  const { lobbyId } = await params

  return (
    <>
      <LobbyMain lobbyId={lobbyId} />
      <LobbyDebug lobbyId={lobbyId} />
    </>
  )
}

export default Page
