import { PAGES } from "@/constants/pages"
import Link from "next/link"

const Page = () => {
  const adminRoutes = [PAGES.ADMIN_GAMES, PAGES.ADMIN_SPHERICAL]

  return (
    <main>
      <h1>Admin</h1>
      <section>
        <ul>
          {adminRoutes.map((route) => (
            <li key={route}>
              <Link href={route}>{route}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default Page
