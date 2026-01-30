import { VisuallyHidden as VisuallyHiddenRadix } from "radix-ui"
import { type ReactNode } from "react"

function VisuallyHidden({ children }: { children: ReactNode }) {
  return <VisuallyHiddenRadix.Root>{children}</VisuallyHiddenRadix.Root>
}

export default VisuallyHidden
