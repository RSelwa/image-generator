"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { PAGES } from "@/constants/pages"
import { useCreateDemoLobbyMutation } from "@/redux/api/lobby"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const Page = () => {
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const [createDemoLobby] = useCreateDemoLobbyMutation()

  const hasStarted = useRef(false)

  useEffect(() => {
    if (!user || hasStarted.current) return
    hasStarted.current = true

    const startDemo = async () => {
      try {
        const lobby = await createDemoLobby({ user }).unwrap()
        router.replace(`${PAGES.LOBBY}/${lobby.id}`)
      } catch (error) {
        console.error("Failed to create demo lobby:", error)
        router.replace(PAGES.HOME)
      }
    }

    startDemo()
  }, [user])

  return (
    <main className="min-h-full-height flex items-center justify-center">
      <p className="text-lg text-muted-primary-foreground">Setting up demo...</p>
    </main>
  )
}

export default Page
