"use client"

import { useRouter } from "next/navigation"
import { type ComponentProps, type ReactNode, type RefObject, useEffect, useRef } from "react"
import * as React from "react"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { useCreateAndJoinLobbyMutation, useCreateDemoLobbyMutation } from "@/redux/api/lobby"
import { selectIsAnonymous, selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

export const CreateLobbyButton = ({ className, children }: { children?: ReactNode } & ComponentProps<"button">) => {
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const userIsAnonymous = useAppSelector(selectIsAnonymous)
  const [createLobbyDoc, { isLoading: isLoadingCreateLobby }] = useCreateAndJoinLobbyMutation({ fixedCacheKey: "create-lobby" })
  const [createDemoLobby, { isLoading: isLoadingCreateDemoLobby }] = useCreateDemoLobbyMutation({ fixedCacheKey: "create-demo-lobby" })
  const isCreatingRef = useRef(false)

  if (!user) return null

  const isLoading = isLoadingCreateDemoLobby || isLoadingCreateLobby

  const handleCreateLobby = async () => {
    if (isLoading || isCreatingRef.current) return
    isCreatingRef.current = true
    try {
      const lobby = userIsAnonymous ? await createDemoLobby({ user }).unwrap() : await createLobbyDoc({ user }).unwrap()

      router.push(`${PAGES.LOBBY}/${lobby.id}`)
    } catch (error) {
      console.error("Failed to create lobby:", error)
      isCreatingRef.current = false
    }
  }

  return (
    <Button data-testid={user.isAnonymous ? "create-lobby-button-demo" : "create-lobby-button"} onClick={handleCreateLobby} disabled={isLoading} className={className}>
      {children || "Play now!"}
      {" "}
      {isLoading && <Loader className="size-4" />}
    </Button>
  )
}

export const HomePlayButton = ({ containerRef, isLoading }: {
  containerRef: RefObject<HTMLButtonElement | null>
  isLoading?: boolean
}) => {
  const followerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current || !followerRef.current) return

    // 1. Get the container's position relative to the viewport
    const rect = containerRef.current.getBoundingClientRect()

    // 2. Calculate the "Local" coordinate
    // e.clientY is the mouse position from the top of the screen
    // rect.top is the distance from the top of the screen to your container
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 3. Center the follower (assuming 50px width/height)
    // Or use followerRef.current.offsetWidth / 2
    const centerX = x - 25
    const centerY = y - 25

    // 4. Boundary Clamping (Don't let it leave the box)
    const clampedX = Math.max(0, Math.min(centerX, rect.width - 50))
    const clampedY = Math.max(0, Math.min(centerY, rect.height - 50))

    // 5. Apply the transform
    followerRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`
  }

  const handleMouseEnter = () => {
    if (!followerRef.current) return
    followerRef.current.classList.remove("invisible")
  }

  const handleMouseLeave = () => {
    if (!followerRef.current) return
    followerRef.current.classList.add("invisible")
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div ref={followerRef} className="absolute top-0 left-0 font-interference w-fit h-fit hidden lg:flex justify-center items-center text-4xl font-bold px-4 py-2 text-primary invisible ">
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
      Play
      {" "}
      {isLoading && <Loader className="size-6" />}
    </div>
  )
}

export const CreateLobbyContainer = () => {
  const router = useRouter()
  const containerRef = useRef<HTMLButtonElement>(null)
  const isCreatingRef = useRef(false)

  const user = useAppSelector(selectUser)
  const userIsAnonymous = useAppSelector(selectIsAnonymous)

  const [createLobbyDoc, { isLoading: isLoadingCreateLobby }] = useCreateAndJoinLobbyMutation({ fixedCacheKey: "create-lobby" })
  const [createDemoLobby, { isLoading: isLoadingCreateDemoLobby }] = useCreateDemoLobbyMutation({ fixedCacheKey: "create-demo-lobby" })

  if (!user) return null

  const isLoading = isLoadingCreateDemoLobby || isLoadingCreateLobby

  const handleCreateLobby = async () => {
    if (isLoading || isCreatingRef.current) return
    isCreatingRef.current = true
    try {
      const lobby = userIsAnonymous ? await createDemoLobby({ user }).unwrap() : await createLobbyDoc({ user }).unwrap()

      router.push(`${PAGES.LOBBY}/${lobby.id}`)
    } catch (error) {
      console.error("Failed to create lobby:", error)
      isCreatingRef.current = false
    }
  }

  return (
    <button ref={containerRef} className="relative cursor-none size-full" data-testid={user.isAnonymous ? "video-create-lobby-button-demo" : "video-create-lobby-button"} onClick={handleCreateLobby} disabled={isLoading}>
      <video autoPlay loop muted className="w-full cursor-none h-full object-cover">
        <source src="/home-video.mp4" />
      </video>
      <HomePlayButton {...{ containerRef, isLoading }} />
    </button>

  )
}
