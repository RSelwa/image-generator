import { type ReactNode } from "react"
import Navbar from "@/components/ui/navbar"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      {/* <Footer /> */}
    </>
  )
}

export default Layout
