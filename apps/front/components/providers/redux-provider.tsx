"use client"

import { type ReactNode, useMemo } from "react"
import { Provider } from "react-redux"
import { makeStore } from "@/redux/store"

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useMemo(() => makeStore(), [])
  const dispatch = store.dispatch

  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_EMULATOR) {
    ;(window as any).__store__ = store
  }

  import("@/redux/api/auth")
    .then(({ authApi }) => dispatch(authApi.endpoints.listenAuth.initiate()))
    .catch((error) => {
      console.error("Failed to initiate auth listener:", error)
    })

  return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
