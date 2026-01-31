"use client"

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
        <p className="text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto">
          Challenge yourself to guess locations from stunning AI-created
          imagery. Explore the world like never before.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
        >
          Start Playing
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
        >
          Learn More
        </button>
      </div>
    </section>
  </main>
)

export default Page
