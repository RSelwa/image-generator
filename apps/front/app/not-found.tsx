import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-full-height">
      <section className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            404
          </h1>
          <p className="text-lg text-muted-primary-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto">
            Page not found. The page you are looking for does not exist.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
        >
          Go back home
        </Link>
      </section>
    </main>
  )
}
