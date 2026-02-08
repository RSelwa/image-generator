import { LobbyDebug } from "@/components/lobby/lobby-debug"
import LobbyMain from "@/components/lobby/lobby-main"

const Page = async () => {
  return (
    <>
      <LobbyMain />
      <LobbyDebug />
    </>
  )
}

export default Page
