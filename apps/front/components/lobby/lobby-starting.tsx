import { usePathname } from "next/navigation"
import * as React from "react"
import { getLobbyIdFromPathname } from "@/utils"

const LobbyStarting = () => {
  const pathname = usePathname()
  const _ = getLobbyIdFromPathname(pathname)

  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-foreground">Game in progress...</p>
    </main>
  )
}

export default LobbyStarting
