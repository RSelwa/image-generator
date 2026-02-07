import { type ComponentProps } from "react"
import { cn } from "@/utils"

export const TextRevealTW = ({
  text,
  initialDelay = 0,
  className,
}: ComponentProps<"div"> & { text: string, initialDelay?: number }) => {
  return (
    <>
      <div className={cn("overflow-hidden text-2xl font-bold leading-6 text-white", className)}>
        {text.match(/./gu)!.map((char, index) => (
          <span
            className="animate-text-reveal inline-block fill-mode-[backwards]"
            key={`${char}-${index}`}
            style={{ animationDelay: `${initialDelay + (index * 0.05)}s` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </>
  )
}
