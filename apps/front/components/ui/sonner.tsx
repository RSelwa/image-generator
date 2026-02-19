"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--primary)",
          "--normal-border": "var(--primary)",
          "--border-radius": "none",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast data-[type=error]:text-destructive! data-[type=error]:border-destructive! data-[type=warning]:text-foreground! data-[type=warning]:border-blue-accent! data-[type=warning]:bg-blue-accent! data-[type=info]:text-foreground! data-[type=info]:border-blue-accent! data-[type=info]:bg-blue-accent!",
          title:"font-interference",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
