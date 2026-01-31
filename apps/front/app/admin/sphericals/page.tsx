"use client"

import { useGetSphericalsInfiniteQuery } from "@/redux/api/spherical"

const Page = () => {
  const { data, isLoading } = useGetSphericalsInfiniteQuery()

  const spherical = data?.pages.flat() || []

  return (
    <main className="p-2 h-full-height-admin">
      <h1>Spherical</h1>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {isLoading && <li>Loading...</li>}

        {spherical?.map(({ image, id, game, difficulty }) => {
          const img = `/api/proxy-image?url=${image}`

          return (
            <li
              key={id}
              className="relative h-64 cursor-pointer overflow-hidden rounded-xl border border-grey-100"
            >
              <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between gap-2">
                <span className="inline-flex h-6 items-center rounded-full px-2 align-middle text-xs leading-none focus:outline-hidden uppercase border border-grey-100 bg-transparent backdrop-blur-sm text-neutral-100">
                  {game.title}
                </span>
                <div className="flex gap-2">
                  <span className="h-6 items-center rounded-full px-2 align-middle text-xs leading-none focus:outline-hidden bg-neutral-950 text-white flex gap-1">
                    {difficulty}
                  </span>
                </div>
              </div>
              <img src={img} alt="" className="size-full object-cover" />
            </li>
          )
        })}
      </ul>
    </main>
  )
}

export default Page
