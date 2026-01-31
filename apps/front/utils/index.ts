import { type ClassValue, clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const copy = (text: string) => {
  navigator.clipboard
    ?.writeText(text)
    .then(() => {
      toast.success("Text copied to clipboard")
    })
    .catch((error) => {
      toast.error(`Could not copy text: ${error}`)
    })
}
