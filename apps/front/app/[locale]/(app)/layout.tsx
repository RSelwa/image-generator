import { type ReactNode } from "react"
import { MessagesListener } from "@/components/providers/messages-listener"
import Navbar from "@/components/ui/navbar"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <MessagesListener />
      {children}
    </>
  )
}

export default Layout
