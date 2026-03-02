import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const copy = (text: string) => navigator.clipboard
  ?.writeText(text)

export const firstLetter = (str: string) => str.charAt(0).toUpperCase()

export const getLobbyIdFromPathname = (pathname: string) => {
  const match = pathname.match(/\/lobby\/([^/]+)/)

  return match ? match[1] : ""
}
