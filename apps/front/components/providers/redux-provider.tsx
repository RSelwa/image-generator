"use client"

import { makeStore } from "@/redux/store"
import { type ReactNode, useMemo } from "react"
import { Provider } from "react-redux"

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useMemo(() => makeStore(), [])

  return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
