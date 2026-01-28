"use client"

import { makeStore } from "@/redux/store"
import { type ReactNode, useMemo } from "react"
import { Provider } from "react-redux"

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useMemo(() => makeStore(), [])
  const dispatch = store.dispatch

  import("@/redux/api/auth")
    .then(({ authApi }) => dispatch(authApi.endpoints.listenAuth.initiate()))
    .catch((error) => {
      console.error("Failed to initiate auth listener:", error)
    })

  return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
