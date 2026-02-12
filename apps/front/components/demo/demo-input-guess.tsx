"use client"

import { type FormEvent, useRef } from "react"
import * as React from "react"
import { useDemoContext } from "@/components/demo/demo-context"
import { Input } from "@/components/ui/input"

const DemoInputGuess = () => {
  const gameFormRef = useRef<HTMLFormElement>(null)
  const { submitGuess, config, livesRemaining, demoMode } = useDemoContext()

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formdata = new FormData(e.currentTarget)
    const input = formdata.get("input")?.toString() || ""
    submitGuess(input)
    gameFormRef.current?.reset()
  }

  return (
    <form ref={gameFormRef} onSubmit={onSubmit} autoComplete="off" className="absolute z-10 left-1/2 -translate-1/2 bottom-8 flex flex-col items-center gap-4">
      {demoMode === "full" && config.playersLives && (
        <div data-testid="demo-lives-container" className="w-full flex justify-center items-center gap-8">
          {Array.from({ length: config.playersLives }, (_, i) => (
            <div
              key={i}
              data-is-filled={i < livesRemaining}
              className="size-6 transition-colors data-[is-filled=false]:shadow-glow-xs data-[is-filled=false]:shadow-red-600/70 data-[is-filled=true]:bg-neutral-50 border border-secondary data-[is-filled=false]:bg-red-500/30"
            />
          ))}
        </div>
      )}
      <Input
        data-testid="demo-game-input-guess"
        name="input"
        type="text"
        placeholder="Your answer"
        autoFocus
        className="bg-background/50! text-2xl! font-bold placeholder:text-foreground/70 text-foreground min-w-96 py-6"
      />
    </form>
  )
}

export default DemoInputGuess
