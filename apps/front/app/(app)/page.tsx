"use client"

import Link from "next/link"
import CreateLobbyButton from "@/components/home-create-lobby"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ASSET_URLS } from "@/constants/mapping"
import { LogoWithIcon, StripVertical } from "@/components/icons"

const Page = () => (
  <main className="relative min-h-full-height">
    <section className="min-h-full-height w-screen! pl-15 relative flex flex-col items-center justify-center text-center space-y-8">
      <article className="bg-primary text-primary-foreground absolute mt-auto w-15 h-full left-0 top-0">
        <StripVertical className="w-9 absolute left-1/2 bottom-4 -translate-x-1/2" />
      </article>
      <article className="absolute bottom-9 left-24 -z-10">
        <LogoWithIcon className="h-48" />
      </article>
      <article className="space-y-4 max-w-3xl">
        <h2 className="font-interference">A PvPvE SURVIVAL EXTRACTION FPS </h2>
        <h1 className="text-4xl uppercase font-shapiro font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Discover the World Through
          {" "}
          <span className="bg-primary bg-clip-text text-transparent">
            AI-Generated
          </span>
          {" "}
          Images
        </h1>
        <p className="text font-mono text-muted-primary-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto">
          Challenge yourself to guess locations from stunning AI-created
          imagery. Explore the world like never before.
        </p>
      </article>

      <article className="flex flex-col sm:flex-row gap-4">
        <CreateLobbyButton />
      </article>
      
    </section>
  </main>
)

export default Page
