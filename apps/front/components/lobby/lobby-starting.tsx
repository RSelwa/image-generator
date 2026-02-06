import * as React from "react"

type Props = {
  lobbyId: string
}

const LobbyStarting = (_: Props) => {
  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-foreground">Game in progress...</p>
    </main>
  )
}

export default LobbyStarting
