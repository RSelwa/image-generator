import { usePathname } from "next/navigation"
import * as React from "react"
import { getLobbyIdFromPathname } from "@/utils"

const LobbyFinished = () => {
  const pathname = usePathname()
  const _ = getLobbyIdFromPathname(pathname)

  return (
    <div>LobbyFinished</div>
  )
}

export default LobbyFinished
