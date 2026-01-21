import { Calendar, Clock, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AutoPost
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Pricing
            </Link>
            <button
              type="button"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
            Schedule Your Instagram Content{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Effortlessly
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
            Plan, schedule, and publish your Instagram posts automatically. Save
            time and grow your audience with our powerful scheduling platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-medium hover:opacity-90 transition-opacity"
            >
              Start Free Trial
            </button>
            <button
              type="button"
              className="px-8 py-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-zinc-900 rounded-3xl"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Powerful features to streamline your Instagram content workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Smart Scheduling
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Schedule posts weeks in advance with our intuitive calendar
              interface
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Auto-Publishing
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Set it and forget it. Your content goes live automatically at the
              perfect time
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Analytics
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Track performance and optimize your posting strategy with detailed
              insights
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Bulk Upload
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Upload multiple posts at once and schedule your entire content
              calendar
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AutoPost
          </div>
          <div className="flex gap-8 text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              href="/terms"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            © 2026 AutoPost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
