import { VisuallyHidden as VisuallyHiddenRadix } from "radix-ui"
import type { ReactNode } from "react"

const VisuallyHidden = ({ children }: { children: ReactNode }) => (
  <VisuallyHiddenRadix.Root>{children}</VisuallyHiddenRadix.Root>
)

export default VisuallyHidden
