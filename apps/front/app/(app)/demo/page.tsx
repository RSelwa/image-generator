"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { PAGES } from "@/constants/pages"
import { useLoginAnonymouslyMutation } from "@/redux/api/auth"
import { useCreateDemoLobbyMutation } from "@/redux/api/lobby"
import { selectSessionIsReady, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const Page = () => {
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const isSessionReady = useAppSelector(selectSessionIsReady)

  const [loginAnonymously] = useLoginAnonymouslyMutation()
  const [createDemoLobby] = useCreateDemoLobbyMutation()

  const hasStarted = useRef(false)

  // Step 1: Sign in anonymously if not authenticated
  useEffect(() => {
    if (isSessionReady && !user) {
      loginAnonymously()
    }
  }, [isSessionReady, user])

  // Step 2: Create demo lobby once authenticated
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
