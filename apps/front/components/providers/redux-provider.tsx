"use client"

import { type ReactNode, useEffect, useMemo } from "react"
import { Provider } from "react-redux"
import { IS_PLAYWRIGHT_EMULATOR } from "@/constants/mapping"
import { makeStore } from "@/redux/store"

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useMemo(() => makeStore(), [])
  const dispatch = store.dispatch

  if (typeof window !== "undefined" && IS_PLAYWRIGHT_EMULATOR) {
    ;(window as any).__store__ = store
  }

  useEffect(() => {
    import("@/redux/api/auth")
      .then(({ authApi }) => dispatch(authApi.endpoints.listenAuth.initiate()))
      .catch((error) => {
        console.error("Failed to initiate auth listener:", error)
      })
  }, [])

  return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
