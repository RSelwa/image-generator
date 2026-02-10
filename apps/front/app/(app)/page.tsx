"use client"

import CreateLobbyButton from "@/components/home-create-lobby"
import { Button } from "@/components/ui/button"

const Page = () => (
  <main className="min-h-full-height">
    <section className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Discover the World Through
          {" "}
          <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            AI-Generated
          </span>
          {" "}
          Images
        </h1>
        <p className="text-lg text-muted-primary-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto">
          Challenge yourself to guess locations from stunning AI-created
          imagery. Explore the world like never before.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <CreateLobbyButton />
        <Button variant="secondary">
          Learn More
        </Button>
      </div>
    </section>
  </main>
)

export default Page
