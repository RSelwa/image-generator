import Footer from "@/components/ui/footer"
import Navbar from "@/components/ui/navbar"
import type { ReactNode } from "react"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default Layout
