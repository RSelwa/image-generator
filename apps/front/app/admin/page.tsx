import Image from "next/image"
import Link from "next/link"
import { PAGES } from "@/constants/pages"

const Page = () => {
  const adminRoutes = [
    {
      url: PAGES.ADMIN_GAMES,
      image: "/signup.png",
      label: "Games",
    },
    {
      url: PAGES.ADMIN_SPHERICAL,
      image: "/signup.png",
      label: "Sphericals",
    },
    {
      url: PAGES.ADMIN_TEST,
      image: "/signup.png",
      label: "Test",
    },
  ]

  return (
    <main className="mb-8 p-4">
      <h1 className="font-semibold italic text-2xl mb-8">Admin</h1>
      <section>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {adminRoutes.map(({ url, image, label }) => (
            <Link
              key={url}
              href={url}
              className="h-64 overflow-hidden rounded-xl relative"
            >
              <Image
                src={image}
                alt="Admin Games"
                width={400}
                height={300}
                className="size-full object-cover"
              />
              <span className="absolute bg-linear-to-b from-transparent to-black/50 inset-x-0 flex w-full -translate-y-full flex-col justify-end p-2 text-white">
                {label}
              </span>
            </Link>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default Page
