"use client"

import { DemoProvider } from "@/components/demo/demo-context"
import DemoPlaying from "@/components/demo/demo-playing"

const Page = () => (
  <DemoProvider>
    <DemoPlaying />
  </DemoProvider>
)

export default Page
