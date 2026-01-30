import { type ClassValue, clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copy(text: string) {
  navigator.clipboard
    ?.writeText(text)
    .then(() => {
      toast.success("Text copied to clipboard")
    })
    .catch((error) => {
      toast.error(`Could not copy text: ${error}`)
    })
}
