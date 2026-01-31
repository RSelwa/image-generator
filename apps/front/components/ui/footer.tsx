import Link from "next/link"
import { APP_NAME } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"

const Footer = () => (
  <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-8 border-t border-zinc-200 dark:border-zinc-800">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex gap-8 text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href={PAGES.TERMS}
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Terms of Service
        </Link>
        <Link
          href={PAGES.PRIVACY}
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Privacy Policy
        </Link>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        © 2026 {APP_NAME}. All rights reserved.
      </p>
    </div>
  </footer>
)

export default Footer
