import CreateLobbyButton from "@/components/home-create-lobby"
import { LogoWithIcon } from "@/components/icons"
import { HomeStrips } from "@/components/home-strips"

const Page = () => (
  <main className="relative min-h-full-height">
    <HomeStrips />
    <article className="absolute bottom-18 w-5/6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:w-auto lg:bottom-9 lg:left-24 -z-10">
      <LogoWithIcon className="lg:h-48" />
    </article>
    <section className="min-h-125 lg:min-h-full-height w-screen lg:pl-15 px-4 relative flex flex-col items-center justify-center text-center space-y-8">
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
