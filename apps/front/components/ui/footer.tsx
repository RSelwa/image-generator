import { APP_NAME } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { Link } from "@/i18n/routing"

const Footer = () => (
  <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-8 border-t border-border">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex gap-8 text-sm text-muted-foreground">
        <Link
          href={PAGES.TERMS}
          className="hover:text-foreground"
        >
          Terms of Service
        </Link>
        <Link
          href={PAGES.PRIVACY}
          className="hover:text-foreground"
        >
          Privacy Policy
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        © 2026 {APP_NAME}. All rights reserved.
      </p>
    </div>
  </footer>
)

export default Footer
