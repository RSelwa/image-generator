import { type ReactNode } from "react"
import { ConversationsPanel } from "@/components/conversations/conversations-panel"
import { MessagesListener } from "@/components/providers/messages-listener"
import Navbar from "@/components/ui/navbar"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <MessagesListener />
      {children}
      <ConversationsPanel />
    </>
  )
}

export default Layout
